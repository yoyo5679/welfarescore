import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import os

# ── .env 파일에서 API 키 로드 ──
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass  # python-dotenv 없으면 os.environ만 사용

SERVICE_KEY = os.environ.get("BOKJIRO_API_KEY", "")
if not SERVICE_KEY:
    raise ValueError("❌ BOKJIRO_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")

BASE_URL = "https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "welfare-score-app", "generated_data.js")


# ── 복지로 API intrsThemaArray → 우리 카테고리 매핑 ──
# 복지로에서 오는 한글 주제명을 앱 카테고리명으로 정규화
THEMA_TO_CAT = {
    "신체건강":    "신체건강",
    "정신건강":    "정신건강",
    "생활지원":    "생활지원",
    "주거":       "주거",
    "일자리":     "일자리",
    "문화·여가":   "문화여가",
    "문화ㆍ여가":  "문화여가",
    "안전·위기":   "안전위기",
    "안전ㆍ위기":  "안전위기",
    "임신·출산":   "임신출산",
    "임신ㆍ출산":  "임신출산",
    "보육":       "보육",
    "교육":       "교육",
    "입양·위탁":   "입양위탁",
    "입양ㆍ위탁":  "입양위탁",
    "보호·돌봄":   "보호돌봄",
    "보호ㆍ돌봄":  "보호돌봄",
    "서민금융":    "서민금융",
    "법률":       "법률",
}

CATEGORY_ICONS = {
    "신체건강": "🏃", "정신건강": "🧠", "생활지원": "🛒", "주거": "🏠",
    "일자리":  "💼", "문화여가": "🎨", "안전위기": "🛡️", "임신출산": "🤰",
    "보육":   "👶", "교육": "📚", "입양위탁": "🏡", "보호돌봄": "🤝",
    "서민금융": "🏦", "법률": "⚖️",
}

# 복지로 lifeArray 값 → 앱 lifeCycle 값
LC_MAP = {
    "임신·출산": "임신출산", "임신ㆍ출산": "임신출산",
    "영유아":   "영유아",
    "아동":    "아동",
    "청소년":   "청소년",
    "청년":    "청년",
    "중장년":   "중장년",
    "노년":    "노년",
}

# 복지로 trgterIndvdlArray 값 → 앱 household 값
HH_MAP = {
    "저소득":    "저소득",
    "장애인":    "장애인",
    "한부모·조손": "한부모조손", "한부모ㆍ조손": "한부모조손",
    "다자녀":    "다자녀",
    "다문화·탈북민": "다문화탈북민", "다문화ㆍ탈북민": "다문화탈북민",
    "보훈대상자": "보훈대상자",
}


def build_condition(lc_values, hh_values):
    """Build JS condition function body from API data."""
    parts = []

    for lc in lc_values:
        mapped = LC_MAP.get(lc.strip())
        if mapped:
            parts.append(f"data.lc.includes('{mapped}')")

    for hh in hh_values:
        mapped = HH_MAP.get(hh.strip())
        if mapped:
            if mapped == "저소득":
                parts.append("data.hh.includes('저소득') || data.incomeNum <= 100")
            else:
                parts.append(f"data.hh.includes('{mapped}')")

    if not parts:
        return "(data) => true"  # 제한 없는 보편 복지

    return "(data) => " + " || ".join(f"({p})" for p in parts)


def fetch_page(page_no, num_rows=100):
    params = {
        "serviceKey": SERVICE_KEY,
        "callTp":     "L",
        "pageNo":     str(page_no),
        "numOfRows":  str(num_rows),
        "srchKeyCode": "001",  # 필수 파라미터
        "servId":     "",
        "lifeArray":  "",
        "trgterIndvdlArray": "",
        "sido":       "",
        "sigungu":    "",
    }
    query = urllib.parse.urlencode(params)
    full_url = f"{BASE_URL}?{query}"

    req = urllib.request.Request(full_url, headers={"Accept": "application/xml"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def fetch_welfare_data():
    all_items = []

    # 1페이지 먼저 가져와서 totalCount 확인
    print("📡 복지로 API 첫 번째 페이지 조회 중...")
    xml1 = fetch_page(1, 100)
    root1 = ET.fromstring(xml1)

    result_code = root1.findtext("resultCode") or ""
    result_msg  = root1.findtext("resultMessage") or ""
    total_count = int(root1.findtext("totalCount") or "0")

    print(f"resultCode: {result_code}, resultMessage: {result_msg}")
    print(f"총 {total_count}건 발견")

    if result_code != "0":
        print(f"❌ API 오류: {result_msg}")
        return []

    def parse_items(root):
        for item in root.findall(".//servList"):
            name     = item.findtext("servNm")     or ""
            desc     = item.findtext("servDgst")   or ""
            tag      = item.findtext("jurOrgNm")   or "중앙부처"
            serv_id  = item.findtext("servId")     or ""
            phone    = item.findtext("rprsCtadr")  or ""
            intrs    = item.findtext("intrsThemaArray") or ""
            life_arr = item.findtext("lifeArray")       or ""
            trgt_arr = item.findtext("trgterIndvdlArray") or ""
            # 복지로 공식 상세 링크를 그대로 사용
            detail_link = item.findtext("servDtlLink") or ""

            if detail_link:
                apply_url = detail_link
            elif serv_id:
                apply_url = f"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId={serv_id}&wlfareInfoReldBztpCd=01"
            else:
                apply_url = "https://www.bokjiro.go.kr"

            # 카테고리 (intrsThemaArray의 첫 번째 주제 사용)
            category = "생활지원"
            for thema in intrs.split(","):
                mapped = THEMA_TO_CAT.get(thema.strip())
                if mapped:
                    category = mapped
                    break

            icon = CATEGORY_ICONS.get(category, "🎁")

            # condition 빌드
            lc_values = [v.strip() for v in life_arr.split(",") if v.strip()]
            hh_values = [v.strip() for v in trgt_arr.split(",") if v.strip()]
            condition = build_condition(lc_values, hh_values)

            all_items.append({
                "name":        f"[중앙정부] {name}",
                "tag":         tag,
                "description": desc,
                "applyUrl":    apply_url,
                "monthlyAmount": 0,
                "icon":        icon,
                "category":    category,
                "relevance":   50,
                "condition":   condition,
                "phone":       phone,
            })

    parse_items(root1)
    print(f"  1페이지: {len(all_items)}건 파싱")

    # 나머지 페이지 전부 가져오기 (전체 데이터 완전 수집)
    total_pages = (total_count + 99) // 100
    for page in range(2, total_pages + 1):
        print(f"  {page}페이지 조회 중...")
        xml_page = fetch_page(page, 100)
        root_page = ET.fromstring(xml_page)
        before = len(all_items)
        parse_items(root_page)
        print(f"  {page}페이지: {len(all_items) - before}건 추가")

    print(f"\n✅ 총 {len(all_items)}건 파싱 완료 (전체 {total_count}건)")
    return all_items



def save_to_js(items):
    lines = ["const welfareData = ["]
    for i, item in enumerate(items):
        comma = "," if i < len(items) - 1 else ""
        lines.append("    {")
        lines.append(f"        name: {json.dumps(item['name'], ensure_ascii=False)},")
        lines.append(f"        tag: {json.dumps(item['tag'], ensure_ascii=False)},")
        lines.append(f"        description: {json.dumps(item['description'], ensure_ascii=False)},")
        lines.append(f"        applyUrl: {json.dumps(item['applyUrl'], ensure_ascii=False)},")
        lines.append(f"        monthlyAmount: {item['monthlyAmount']},")
        lines.append(f"        icon: {json.dumps(item['icon'], ensure_ascii=False)},")
        lines.append(f"        category: {json.dumps(item['category'], ensure_ascii=False)},")
        lines.append(f"        relevance: {item['relevance']},")
        lines.append(f"        condition: {item['condition']}")
        lines.append(f"    }}{comma}")
    lines.append("];")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"💾 {len(items)}건 저장 완료 → {OUTPUT_FILE}")


if __name__ == "__main__":
    try:
        items = fetch_welfare_data()
        if items:
            save_to_js(items)
        else:
            print("저장할 항목이 없습니다.")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

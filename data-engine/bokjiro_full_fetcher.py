"""
bokjiro_full_fetcher.py
복지로 NationalWelfareInformationsV001 API로 전체 서비스 목록 + 공식 해시태그를 가져오는 스크립트
"""
import urllib.request, urllib.parse
import xml.etree.ElementTree as ET
import json
import time
import os

API_KEY = '9a318bb9e3744a79987a64668e6e67c3c8e4fd22b7c261aeddc03af627730a09'
LIST_URL = 'http://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001'
NUM_ROWS = 500  # 최대 500개

def fetch_list_page(page=1, num_rows=500, search_word=''):
    """복지로 서비스 목록 1페이지 조회"""
    params = {
        'serviceKey': API_KEY,
        'callTp': 'L',
        'pageNo': str(page),
        'numOfRows': str(num_rows),
        'srchKeyCode': '003',  # 제목+내용 검색 (필수!)
    }
    if search_word:
        params['searchWrd'] = search_word
    
    qs = urllib.parse.urlencode(params)
    url = f'{LIST_URL}?{qs}'
    
    with urllib.request.urlopen(url, timeout=20) as res:
        raw = res.read().decode('utf-8')
    
    root = ET.fromstring(raw)
    rc = root.findtext('resultCode')
    tc = root.findtext('totalCount')
    
    if rc != '0':
        raise Exception(f"API 오류: {root.findtext('resultMessage')}")
    
    items = []
    for serv in root.iter('servList'):
        item = {}
        for child in serv:
            item[child.tag] = (child.text or '').strip()
        items.append(item)
    
    return items, int(tc or 0)

def parse_tags(life_array, trgter_array, intrs_thema_array):
    """태그 문자열을 리스트로 파싱"""
    tags = []
    for raw in [life_array, trgter_array, intrs_thema_array]:
        if raw:
            for t in raw.split(','):
                t = t.strip()
                if t and t not in tags:
                    tags.append(t)
    return tags

def main():
    print("=== 복지로 전체 서비스 데이터 수집 시작 ===\n")
    
    all_items = []
    
    # 전체 검색 (srchKeyCode 필수이나 searchWrd 없이도 동작)
    # 첫 페이지로 totalCount 확인
    print("1단계: 전체 서비스 수 확인...")
    try:
        test_items, total = fetch_list_page(page=1, num_rows=1)
        print(f"  총 {total}개 서비스 발견")
    except Exception as e:
        print(f"  오류: {e}")
        # searchWrd 없이는 안 될 수 있으니 빈 searchWrd로 시도
        total = 0
    
    if total == 0:
        print("  searchWrd 없이 실패 - 전체 목록은 searchWrd='' 로 시도")
        # totalCount가 0이면 다른 방식으로
        # 실제로는 srchKeyCode=003 + searchWrd='' 시도
        
    # 페이지별로 가져오기
    print(f"\n2단계: 전체 데이터 수집 (최대 500개)...")
    
    items, total = fetch_list_page(page=1, num_rows=500)
    print(f"  1페이지 수집: {len(items)}개 (전체 {total}개)")
    all_items.extend(items)
    
    # 500개 초과 시 추가 페이지
    if total > 500:
        pages = (total // 500) + 1
        for page in range(2, min(pages + 1, 5)):  # 최대 2000개까지
            try:
                items_page, _ = fetch_list_page(page=page, num_rows=500)
                print(f"  {page}페이지 수집: {len(items_page)}개")
                all_items.extend(items_page)
                time.sleep(0.5)
            except Exception as e:
                print(f"  {page}페이지 오류: {e}")
                break
    
    print(f"\n  총 수집: {len(all_items)}개")
    
    # 결과 변환
    print("\n3단계: 데이터 변환 중...")
    processed = []
    for item in all_items:
        life = item.get('lifeArray', '')
        trgter = item.get('trgterIndvdlArray', '')
        intrs = item.get('intrsThemaArray', '')
        
        hashtags = parse_tags(life, trgter, intrs)
        
        processed.append({
            'id': f"bokjiro_{item.get('servId', '')}",
            'name': item.get('servNm', ''),
            'description': item.get('servDgst', ''),
            'agency': item.get('jurMnofNm', ''),
            'applyUrl': item.get('servDtlLink', '#'),
            'lifeArray': life,
            'trgterIndvdlArray': trgter,
            'intrsThemaArray': intrs,
            'hashtags': hashtags,  # ← 공식 해시태그!
            'servId': item.get('servId', ''),
            'sprtCycNm': item.get('sprtCycNm', ''),
            'srvPvsnNm': item.get('srvPvsnNm', ''),
            'onapPsbltYn': item.get('onapPsbltYn', ''),
        })
    
    # 파일 저장
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bokjiro_official_data.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 완료! {len(processed)}개 저장 → bokjiro_official_data.json")
    
    # 샘플 출력
    print("\n=== 샘플 5개 ===")
    for item in processed[:5]:
        print(f"\n이름: {item['name']}")
        print(f"기관: {item['agency']}")
        print(f"해시태그: {item['hashtags']}")
        print(f"  (생애: {item['lifeArray']} | 가구: {item['trgterIndvdlArray']} | 주제: {item['intrsThemaArray']})")
    
    return processed

if __name__ == '__main__':
    main()

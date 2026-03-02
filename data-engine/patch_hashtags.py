"""
patch_hashtags_v2.py
서비스명 유사도 매칭으로 더 많은 항목의 해시태그를 교체합니다.
"""
import json
import re
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

# ========================================
# 1. 복지로 공식 태그 로드
# ========================================
bokjiro_path = os.path.join(current_dir, 'bokjiro_official_data.json')
with open(bokjiro_path, 'r', encoding='utf-8') as f:
    bokjiro_data = json.load(f)

bokjiro_map = {}
for item in bokjiro_data:
    name = item['name'].strip()
    hashtags = item['hashtags']
    if hashtags:
        bokjiro_map[name] = hashtags

print(f"복지로 공식 태그 보유 서비스: {len(bokjiro_map)}개")

# ========================================
# 2. 기존 generated_data.js에서 서비스명 추출
# ========================================
js_path = os.path.join(root_dir, 'generated_data.js')
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 기존 JS에서 모든 name 추출
existing_names = re.findall(r"name: '([^']+)'", content)
print(f"기존 JS 서비스명: {len(existing_names)}개")

# ========================================
# 3. 이름 매칭 전략
# ========================================
def normalize(name):
    """서비스명 정규화 (핵심 키워드 추출)"""
    # 대괄호 내용 제거 ([온통청년] 등)
    name = re.sub(r'\[.*?\]', '', name)
    # 특수문자/공백 제거
    name = re.sub(r'[\s\-·,·/()]', '', name)
    return name.strip().lower()

def find_best_match(target_name, candidates):
    """대상 이름과 가장 잘 매칭되는 후보 찾기"""
    norm_target = normalize(target_name)
    
    best_match = None
    best_score = 0
    
    for candidate in candidates:
        norm_cand = normalize(candidate)
        
        # 1순위: 정확히 일치
        if norm_target == norm_cand:
            return candidate, 100
        
        # 2순위: 한쪽이 다른쪽을 포함
        if norm_target in norm_cand or norm_cand in norm_target:
            score = min(len(norm_target), len(norm_cand)) / max(len(norm_target), len(norm_cand)) * 90
            if score > best_score:
                best_score = score
                best_match = candidate
        
        # 3순위: 공통 문자 비율 (50자 이상 공통이면)
        if len(norm_target) >= 6 and len(norm_cand) >= 6:
            common = sum(1 for c in norm_target if c in norm_cand)
            score = common / max(len(norm_target), len(norm_cand)) * 70
            if score > 50 and score > best_score:
                best_score = score
                best_match = candidate
    
    if best_score >= 60:
        return best_match, best_score
    return None, 0

# 매칭 테이블 구성
print("\n=== 매칭 결과 ===")
match_table = {}  # existing_name → official_tags
no_match = []

for existing_name in existing_names:
    # 1. 직접 매칭
    name_safe = existing_name.replace("\\'", "'")
    if name_safe in bokjiro_map:
        match_table[existing_name] = bokjiro_map[name_safe]
        continue
    
    # 2. 유사도 매칭
    best, score = find_best_match(existing_name, list(bokjiro_map.keys()))
    if best:
        match_table[existing_name] = bokjiro_map[best]
        print(f"  [{score:.0f}%] '{existing_name[:35]}' → '{best[:35]}'")
        print(f"         태그: {bokjiro_map[best]}")
    else:
        no_match.append(existing_name)

print(f"\n✅ 매칭 성공: {len(match_table)}개")
print(f"⚠️  매칭 없음 (기존 태그 유지): {len(no_match)}개")

# ========================================
# 4. generated_data.js에 hashtags 교체 적용
# ========================================
def replace_hashtags(content, service_name, new_tags):
    name_js = service_name.replace("'", "\\'")
    pattern = (
        r"(name: '" + re.escape(name_js) + r"',"
        r".*?"
        r"hashtags: )\[.*?\]"
    )
    new_tags_str = json.dumps(new_tags, ensure_ascii=False)
    new_content, n = re.subn(pattern, r'\g<1>' + new_tags_str, content, count=1, flags=re.DOTALL)
    return new_content, n > 0

replaced = 0
for existing_name, official_tags in match_table.items():
    content, ok = replace_hashtags(content, existing_name, official_tags)
    if ok:
        replaced += 1

print(f"\n✅ hashtags 교체 완료: {replaced}개")

# ========================================
# 5. 저장
# ========================================
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ 저장 완료: generated_data.js")
print(f"\n📌 정리:")
print(f"  - 기존 데이터(조건, 설명 등): 완전 보존")
print(f"  - 복지로 공식 해시태그로 교체: {replaced}개")
print(f"  - 기존 키워드 매칭 해시태그 유지: {len(no_match)}개")

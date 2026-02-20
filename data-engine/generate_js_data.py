import json
import json
import os

# Logger (Data Team Lead) says: "Converting raw data filter logic to live JS condition functions."

def generate_js():
    input_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/unified_welfare_data.json"
    
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Region mapping: answers[region] -> residence name
    region_map = {
        'seoul': '서울', 'gyeonggi': '경기', 'incheon': '인천',
        'jeonbuk': '전북', 'jeonnam': '전남', 'chungbuk': '충북',
        'chungnam': '충남', 'gyeongnam': '경남', 'gyeongbuk': '경북',
        'jeju': '제주', 'gangwon': '강원', 'busan': '부산',
        'daegu': '대구', 'ulsan': '울산', 'daejeon': '대전', 'sejong': '세종'
    }

    # Age mapping: labels -> typical number or range
    # label: typical_age (for simple range check)
    age_map = {
        '10대이하': 15, '20대': 25, '30대': 35, '40대': 45, '50대': 55, '60대이상': 70
    }

    # Keyword Mapping for Auto-Categorization (Housing, Job, Medical, etc.)
    KEYWORD_MAP = {
        '주거': ['월세', '전세', '주택', '임대', '보증금', '대출', '기숙사', '관리비', '주거', '부동산', '이사'],
        '취업': ['취업', '창업', '일자리', '구직', '근로', '인턴', '채용', '직무', '훈련', '소상공인', '면접', '자격증'],
        '의료': ['병원', '검진', '치료', '수술', '보건', '의료', '산모', '치매', '건강', '심리', '정신', '난임', '장애'],
        '육아': ['육아', '보육', '돌봄', '어린이', '유치원', '급식', '청소년', '출산'],
        '교육': ['교육', '장학금', '학교', '학생', '학비', '등록금', '강의'],
        '생활비': ['생계', '지원금', '바우처', '교통비', '문화', '예술', '통신비', '에너지', '가스', '전기', '난방']
    }

    js_code = "const welfareData = [\n"
    
    for item in data:
        name = item['name']
        desc_raw = item['description']
        desc = json.dumps(desc_raw, ensure_ascii=False)[1:-1].replace("'", "\\'")
        agency = item['agency']
        
        # Auto-Categorization Logic
        category = '생활비' # Default to General Living if no match
        full_text = (name + " " + desc_raw + " " + agency).lower()
        
        # Check for matches
        for cat, keywords in KEYWORD_MAP.items():
            if any(k in full_text for k in keywords):
                category = cat
                break # Stop at first match (Priority: Housing > Job > Medical > Childcare > Living)

        amount = item.get('amount_max', 0)
        # Handle various URL keys from different sources
        url = item.get('source_url') or item.get('applyUrl') or item.get('url') or '#'
        
        eligibility = item.get('eligibility', {})
        res_list = eligibility.get('residence', [])
        age_range = eligibility.get('age', [0, 100])
        income_text = eligibility.get('income', '')
        target = eligibility.get('target', '')

        # Build JS condition string
        conditions = []
        
        # Residence check
        if res_list:
            # Match internal slug to human name
            slugs = [k for k, v in region_map.items() if any(r in v for r in res_list)]
            if slugs:
                slug_check = " || ".join([f"d.region === '{s}'" for s in slugs])
                
                # District (Sub-residence) check
                sub_res_list = eligibility.get('sub_residence', [])
                if sub_res_list:
                    sub_slug_check = " || ".join([f"d.subRegion === '{sr}'" for sr in sub_res_list])
                    conditions.append(f"({slug_check} && {sub_slug_check})")
                else:
                    conditions.append(f"({slug_check})")
        
        # Age check
        if age_range:
            age_conds = []
            for label, val in age_map.items():
                if age_range[0] <= val <= age_range[1]:
                    age_conds.append(f"d.age === '{label}'")
            if age_conds:
                conditions.append(f"({' || '.join(age_conds)})")

        # Income / Target (Strict Logic according to V13 flow)
        if income_text:
            if '100%' in income_text or '120%' in income_text:
                conditions.append("(d.income === '100-250만원' || d.income === '100만원미만' || d.income === '250-450만원')")
            elif '75%' in income_text or '50%' in income_text or '기초' in income_text or '차상위' in income_text:
                conditions.append("(d.income === '100만원미만' || d.income === '100-250만원')")

        if target:
            if '소상공인' in target or '자영업' in target:
                conditions.append("(d.target === '소상공인')")
            if '임산부' in target or '출산' in target:
                conditions.append("(d.target === '임산부')")
            if '위기' in target or '채무' in target:
                 conditions.append("(d.target === '위기가구')")
            if '구직' in target or '실업' in target or '미취업' in target:
                 conditions.append("(d.target === '구직')")

        # Household Check
        household_text = eligibility.get('household', '') + " " + target + " " + full_text
        if '다자녀' in household_text:
             conditions.append("(d.household === '다자녀')")
        if '한부모' in household_text:
             conditions.append("(d.household === '한부모')")
        if '신혼부부' in household_text:
             conditions.append("(d.household === '신혼부부')")
        
        # --- Generate Bokjiro Hashtags ---
        tags = []
        
        # 1. Life Cycle
        if any(x in full_text for x in ['청년', '대학생', '구직']): tags.append('청년')
        if any(x in full_text for x in ['중장년', '재취업', '50대']): tags.append('중장년')
        if any(x in full_text for x in ['노년', '어르신', '고령', '65세', '기초연금']): tags.append('노년')
        if any(x in full_text for x in ['임신', '출산', '산모']): tags.append('임신·출산')
        if any(x in full_text for x in ['영유아', '어린이', '유아']): tags.append('영유아')
        if any(x in full_text for x in ['아동', '초등', '입학']): tags.append('아동')
        if any(x in full_text for x in ['청소년', '학생']): tags.append('청소년')
        
        # 2. Household Situation
        if any(x in full_text for x in ['장애인']): tags.append('장애인')
        if any(x in full_text for x in ['국가유공자', '보훈']): tags.append('국가유공자·보훈보상대상자')
        if any(x in full_text for x in ['저소득', '기초생활', '차상위', '수급자']): tags.append('저소득')
        if any(x in full_text for x in ['다문화', '탈북민', '귀화']): tags.append('다문화·탈북민')
        if any(x in full_text for x in ['다자녀']): tags.append('다자녀')
        if any(x in full_text for x in ['한부모', '조손', '미혼모']): tags.append('한부모·조손')
        if any(x in full_text for x in ['소년소녀', '위탁', '보호종료']): tags.append('소년소녀가장·자립준비청년')
        if any(x in full_text for x in ['독거노인', '노인맞춤']): tags.append('독거노인')
        
        # 3. Topic of Interest
        if any(x in full_text for x in ['신체건강', '건강검진', '의료비', '질병']): tags.append('신체건강')
        if any(x in full_text for x in ['정신건강', '심리상담', '우울', '자살']): tags.append('정신건강')
        if any(x in full_text for x in ['보육', '교육', '학비', '장학금', '급식']): tags.append('보육/교육')
        if any(x in full_text for x in ['일자리', '취업', '창업', '구직']): tags.append('일자리')
        if any(x in full_text for x in ['주거', '부동산', '전세', '월세', '주택']): tags.append('주거')
        if any(x in full_text for x in ['문화', '여가', '예술']): tags.append('문화/여가')
        if any(x in full_text for x in ['안전', '재난', '피해']): tags.append('안전/위기')
        if any(x in full_text for x in ['보호', '돌봄', '요양']): tags.append('보호/돌봄')
        if any(x in full_text for x in ['법률', '노무', '구조']): tags.append('법률/노무')
        
        # 4. Filter empty/None values and unique
        tags_str = json.dumps(list(set(tags)), ensure_ascii=False)
        
        if 'condition' in item and item['condition']:
             condition_str = item['condition']
        elif not conditions:
            condition_str = "true" # Default if no info
        else:
            condition_str = " && ".join(conditions)

        js_code += "    {\n"
        js_code += f"        name: '{name}',\n"
        js_code += f"        description: '{desc}',\n"
        js_code += f"        icon: '💎', tag: '{agency}',\n"
        js_code += f"        hashtags: {tags_str},\n"
        js_code += f"        applyUrl: '{url}',\n"
        js_code += f"        apply_period: '{item.get('apply_period', '')}',\n"
        js_code += f"        howTo: ['상세 공고 확인', '온라인/방문 신청'],\n"
        js_code += f"        condition: (d) => {condition_str},\n"
        js_code += f"        raw_category: '{category}',\n"
        js_code += f"        category: '{category}',\n"
        js_code += f"        relevance: 95, monthlyAmount: {amount // 6 if '6개월' in item.get('amount_text', '') else amount}\n"
        js_code += "    },\n"

    js_code += "];"

    output_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/generated_data.js"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_code)
    print(f"Generated JS data at {output_path}")

if __name__ == "__main__":
    generate_js()

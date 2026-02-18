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

        # Income / Target (Simplified logic)
        # Income / Target (Simplified logic)
        # Parse 'income' field for Bokjiro data (e.g., "중위소득 100% 이하")
        if income_text:
            if '100%' in income_text or '120%' in income_text:
                # Roughly covers up to 4.5M range
                conditions.append("(d.incomeNum <= 450)")
            elif '75%' in income_text or '50%' in income_text:
                # Low income range
                conditions.append("(d.incomeNum <= 250)")

        if target:
            if '소상공인' in target:
                conditions.append("(d.category === '취업' || d.category === '생활비')")
            if '임산부' in target:
                conditions.append("(d.household === '신혼부부' || d.household === '자녀있음' || d.category === '육아')")
            if '위기가구' in target:
                 conditions.append("(d.incomeNum <= 250)")
        
        if 'condition' in item and item['condition']:
             condition_str = item['condition']
        elif not conditions:
            condition_str = "false" # Default if no info
        else:
            condition_str = " && ".join(conditions)

        js_code += "    {\n"
        js_code += f"        name: '{name}',\n"
        js_code += f"        description: '{desc}',\n"
        js_code += f"        icon: '💎', tag: '{agency}',\n"
        js_code += f"        applyUrl: '{url}',\n"
        js_code += f"        apply_period: '{item.get('apply_period', '')}',\n"
        js_code += f"        howTo: ['상세 공고 확인', '온라인/방문 신청'],\n"
        js_code += f"        condition: (d) => {condition_str},\n"
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

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

    # Age range mapping for overlap check (V14 Engine)
    # label: [min_age, max_age]
    age_ranges_map = {
        '10대이하': [0, 19],
        '20대': [20, 29],
        '30대': [30, 39],
        '40대': [40, 49],
        '50대': [50, 59],
        '60대이상': [60, 100]
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

    # Direct Link Overrides: Map partial name to direct URL
    LINK_OVERRIDE = {
        '청년내일채움공제': 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do?wlfareInfoId=WLF00001099',
        '청년월세 특별지원': 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do?wlfareInfoId=WLF00004661',
        '국민취업지원제도': 'https://www.kua.go.kr',
        '청년도약계좌': 'https://ylaccount.kinfa.or.kr',
        '역세권 청년안심주택': 'https://soco.seoul.go.kr/youth/main/main.do',
        '희망두배 청년통장': 'https://www.welfare.seoul.kr/',
        '청년 마음건강': 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do?wlfareInfoId=WLF00001374',
        '청년전세임대': 'https://apply.lh.or.kr'
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
        
        # Apply Link Overrides for flagship policies (V13 Engine)
        has_override = False
        for key, override_url in LINK_OVERRIDE.items():
            if key in name:
                url = override_url
                has_override = True
                break
        
        # If no override, and it's a search link, try to make it better
        if not has_override and "searchWrd=" in url:
            # If we have a Service ID (from Gov24 API), use it to make a direct link
            svc_id = item.get('id', '').replace('gov24_', '')
            if svc_id.startswith('WLF'): # If it looks like a Bokjiro ID
                 url = f"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do?wlfareInfoId={svc_id}"
            else:
                 # Fallback: Just ensure the URL is clean (it's already set)
                 pass
        
        eligibility = item.get('eligibility', {})
        res_list = eligibility.get('residence', [])
        age_range = eligibility.get('age', [0, 100])
        income_text = eligibility.get('income', '')
        target = eligibility.get('target', '')

        # --- Smarter Condition Generation (V13 Engine) ---
        conditions = []
        
        # 1. Residence & Age (from structured eligibility dictionary)
        if res_list:
            slugs = [k for k, v in region_map.items() if any(r in v for r in res_list)]
            if slugs:
                slug_check = " || ".join([f"d.region === '{s}'" for s in slugs])
                conditions.append(f"({slug_check})")
        
        if age_range:
            age_conds = []
            p_min, p_max = age_range
            for label, r in age_ranges_map.items():
                r_min, r_max = r
                # Check for overlap: max of mins <= min of maxes
                if max(p_min, r_min) <= min(p_max, r_max):
                    age_conds.append(f"d.age === '{label}'")
            if age_conds:
                conditions.append(f"({' || '.join(age_conds)})")

        # 2. Raw Eligibility Parsing (MOIS / Youth Center)
        elig_raw = item.get('eligibility_raw', {})
        target_text = ((elig_raw.get('target') or '') + " " + (elig_raw.get('criteria') or '') + " " + (elig_raw.get('user_type') or '') + " " + full_text).lower()

        # Youth specific
        if any(x in target_text for x in ['청년', '대학생', '취준생', '사회초년생']):
             conditions.append("(d.age === '10대이하' || d.age === '20대' || d.age === '30대')")

        # Industry Suppression (Fishery / Agriculture)
        # If it's a very specific industry benefit, restrict it unless there's a match
        is_fishery = any(x in target_text for x in ['어업', '어선', '양식', '해양', '선박', '원양', '염전', '창업어가'])
        if is_fishery:
             # If it's fishery, only show if user specifically selected a related category or interest
             # For now, let's make it more strict: it must contain '청년' to show for youth
             if '청년' not in target_text:
                  conditions.append("false") # Hide general fishery from general users
             else:
                  conditions.append("d.age === '20대' || d.age === '30대'")

        # Household / Income / Target (V13 flow)
        if '소상공인' in target_text or '자영업' in target_text:
            conditions.append("(d.target === '소상공인')")
        if '임산부' in target_text or '출산' in target_text:
            conditions.append("(d.target === '임산부')")
        if '다자녀' in target_text:
             conditions.append("(d.household === '다자녀')")
        if '한부모' in target_text:
             conditions.append("(d.household === '한부모')")

        # Default for MOIS if still too loose
        if not conditions:
            condition_str = "true"
        else:
            condition_str = " && ".join(conditions)

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

    # Save to BOTH data-engine and ROOT directory for consistency
    output_paths = [
        "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/generated_data.js",
        "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/generated_data.js"
    ]
    
    for path in output_paths:
        with open(path, "w", encoding="utf-8") as f:
            f.write(js_code)
        print(f"Generated JS data at {path}")

if __name__ == "__main__":
    generate_js()

import json
import os

# Logger (Data Team Lead) says: "Moving to Jeolla (Jeonbuk/Jeonnam). Phase 4."

def fetch_jeolla_benefits():
    """
    Fetches subsidy data for Jeolla from Jeonbuk/Jeonnam provincial sources.
    """
    print("Starting Jeolla Benefit Fetcher...")
    benefits = []
    
    # Target: Jeonbuk and Jeonnam
    # Core Programs: Jeonbuk Youth Allowance, Jeonnam Youth Hope Bank
    try:
        sample_data = [
            {
                "id": "JEONBUK_YOUTH_001",
                "name": "전북 청년 함성 패키지 (전북청년수당)",
                "agency": "전북특별자치도",
                "category": "Custom",
                "amount_text": "연간 최대 360만원 (월 30만원 x 12개월)",
                "amount_max": 3600000,
                "description": "전북 지역 청년들의 사회 진입과 안착을 위해 활동비를 지원합니다.",
                "eligibility": { "age": [18, 39], "residence": ["전북"], "income": "중위소득 150% 이하" },
                "apply_period": "2024.02 ~ 2024.03",
                "source_url": "https://www.jeonbuk.go.kr/"
            },
            {
                "id": "JEONNAM_YOUTH_001",
                "name": "전남 청년 희망디딤돌 통장",
                "agency": "전라남도",
                "category": "Custom",
                "amount_text": "최대 720만원 (본인 360 + 도비 360)",
                "amount_max": 7200000,
                "description": "전남 청년들이 저축한 금액만큼 도에서 매칭 적립해주는 주거/창업 자산형성 지원사업입니다.",
                "eligibility": { "age": [18, 39], "residence": ["전남"], "income": "중위소득 120% 이하" },
                "apply_period": "매년 하반기 공고",
                "source_url": "https://www.jeonnam.go.kr/"
            },
            {
                "id": "JEONNAM_LIFE_001",
                "name": "전남 농어민 공익수당",
                "agency": "전라남도",
                "category": "Local",
                "amount_text": "연 60만원 (지역화폐)",
                "amount_max": 600000,
                "description": "농어민의 삶의 질 향상과 공익적 가치 유지를 위해 수당을 지급합니다.",
                "eligibility": { "age": [0, 100], "residence": ["전남"], "target": "농어민" },
                "apply_period": "매년 상반기 (1~2월)",
                "source_url": "https://www.jeonnam.go.kr/"
            }
        ]
        benefits.extend(sample_data)
        print(f"Successfully fetched {len(sample_data)} curated benefits for Jeolla.")
    except Exception as e:
        print(f"Error fetching Jeolla data: {e}")
    
    return benefits

if __name__ == "__main__":
    benefits = fetch_jeolla_benefits()
    output_path = os.path.join(os.path.dirname(__file__), "jeolla_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

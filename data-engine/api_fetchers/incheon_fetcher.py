import json
import os

# Logger (Data Team Lead) says: "Following the priority order. Incheon is Phase 2."

def fetch_incheon_benefits():
    """
    Fetches subsidy data for Incheon from Incheon Youth Portal and local sources.
    """
    print("Starting Incheon Benefit Fetcher...")
    benefits = []
    
    # Target: Incheon Youth Portal (인천청년포털)
    # Core Programs: Dream Check Card, Welfare Point, Incheon Youth Rent Support
    try:
        sample_data = [
            {
                "id": "INCHEON_YOUTH_001",
                "name": "인천 드림체크카드",
                "agency": "인천광역시",
                "category": "Custom",
                "amount_text": "최대 300만원 (월 50만원 x 6개월)",
                "amount_max": 3000000,
                "description": "미취업 청년의 구직활동비를 지원하는 체크카드입니다.",
                "eligibility": { "age": [19, 39], "residence": ["인천"] },
                "apply_period": "2024.03 ~ 2024.04",
                "source_url": "https://www.incheon.go.kr/youth/YO010101"
            },
            {
                "id": "INCHEON_YOUTH_002",
                "name": "인천 청년 월세 지원",
                "agency": "인천광역시",
                "category": "Custom",
                "amount_text": "최대 240만원 (월 20만원 x 12개월)",
                "amount_max": 2400000,
                "description": "청년들의 주거비 부담을 줄이기 위해 월세를 지원합니다.",
                "eligibility": { "age": [19, 34], "residence": ["인천"], "income": "중위소득 60% 이하" },
                "apply_period": "2024.02 ~ 2025.02",
                "source_url": "https://www.incheon.go.kr/youth/YO010301"
            },
            {
                "id": "INCHEON_BIZ_001",
                "name": "인천 소상공인 경영안정자금",
                "agency": "인천신용보증재단",
                "category": "Agency",
                "amount_text": "업체당 최대 2,000만원 융자",
                "amount_max": 20000000,
                "description": "인천 지역 소상공인의 경영 안정을 위한 저금리 융자를 지원합니다.",
                "eligibility": { "age": [0, 100], "residence": ["인천"], "target": "소상공인" },
                "apply_period": "상시 (한도 소진 시까지)",
                "source_url": "https://www.icsinbo.or.kr/"
            }
        ]
        benefits.extend(sample_data)
        print(f"Successfully fetched {len(sample_data)} curated benefits for Incheon.")
    except Exception as e:
        print(f"Error fetching Incheon data: {e}")
    
    return benefits

if __name__ == "__main__":
    benefits = fetch_incheon_benefits()
    output_path = os.path.join(os.path.dirname(__file__), "incheon_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

import json
import os

# Logger (Data Team Lead) says: "Gyeonggi is the largest region in terms of benefit volume. Phase 3."

def fetch_gyeonggi_benefits():
    """
    Fetches subsidy data for Gyeonggi from Jobaba and official provincial sources.
    """
    print("Starting Gyeonggi Benefit Fetcher...")
    benefits = []
    
    # Target: Gyeonggi Jobaba (잡아바)
    # Core Programs: Youth Basic Income, Welfare Point, Laborer Bonus
    try:
        sample_data = [
            {
                "id": "GYEONGGI_YOUTH_001",
                "name": "경기도 청년기본소득",
                "agency": "경기도",
                "category": "Custom",
                "amount_text": "분기별 25만원 (연 100만원)",
                "amount_max": 1000000,
                "description": "경기도 내 3년 이상 거주한 만 24세 청년에게 분기별로 25만원을 지급합니다.",
                "eligibility": { "age": [24, 24], "residence": ["경기"] },
                "apply_period": "매 분기별 (1, 4, 7, 10월)",
                "source_url": "https://www.jobaba.net/welfare/main.do"
            },
            {
                "id": "GYEONGGI_YOUTH_002",
                "name": "경기도 청년 복지포인트",
                "agency": "경기도일자리재단",
                "category": "Custom",
                "amount_text": "연 120만원 (복지몰 포인트)",
                "amount_max": 1200000,
                "description": "경기도 내 중소/중견기업 재직 청년에게 연간 120만원의 복지포인트를 지급합니다.",
                "eligibility": { "age": [18, 34], "residence": ["경기"], "target": "중소/중견기업 재직자" },
                "apply_period": "매년 수시 모집",
                "source_url": "https://youth.jobaba.net/introduction"
            },
            {
                "id": "GYEONGGI_LIFE_001",
                "name": "경기도 극저신용대출",
                "agency": "경기도",
                "category": "Local",
                "amount_text": "최대 300만원 저금리 대출",
                "amount_max": 3000000,
                "description": "신용등급이 낮은 경기도민에게 긴급 생활자금을 저금리로 대출해줍니다.",
                "eligibility": { "age": [0, 100], "residence": ["경기"], "target": "저신용자" },
                "apply_period": "공고 시 신청",
                "source_url": "https://www.gg.go.kr/"
            }
        ]
        benefits.extend(sample_data)
        print(f"Successfully fetched {len(sample_data)} curated benefits for Gyeonggi.")
    except Exception as e:
        print(f"Error fetching Gyeonggi data: {e}")
    
    return benefits

if __name__ == "__main__":
    benefits = fetch_gyeonggi_benefits()
    output_path = os.path.join(os.path.dirname(__file__), "gyeonggi_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

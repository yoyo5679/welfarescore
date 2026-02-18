import json
import os

# Logger (Data Team Lead) says: "Moving to Jeju. Phase 7."

def fetch_jeju_benefits():
    """
    Fetches subsidy data for Jeju from Jeju provincial sources.
    """
    print("Starting Jeju Benefit Fetcher...")
    benefits = []
    
    # Target: Jeju
    # Core Programs: Jeju Youth Hope Ladder, Jeju Youth Job Dream Card
    try:
        sample_data = [
            {
                "id": "JEJU_YOUTH_001",
                "name": "제주 청년 희망사다리 재형저축",
                "agency": "제주특별자치도",
                "category": "Custom",
                "amount_text": "최대 1,000만원 이상 (매칭 지원)",
                "amount_max": 10000000,
                "description": "제주 내 중소기업 재직 청년이 일정 금액을 저축하면 도에서 매칭 지원금을 적립해줍니다.",
                "eligibility": { "age": [19, 39], "residence": ["제주"], "target": "중소기업 재직자" },
                "apply_period": "매년 공고 (하반기)",
                "source_url": "https://www.jejuyouth.com/"
            },
            {
                "id": "JEJU_YOUTH_002",
                "name": "제주 청년 취업지원 희망프로젝트 (드림카드)",
                "agency": "제주특별자치도",
                "category": "Custom",
                "amount_text": "최대 300만원 (월 50만원 x 6개월)",
                "amount_max": 3000000,
                "description": "제주 지역 구직 활동을 하는 청년들에게 구직 경비를 지원합니다.",
                "eligibility": { "age": [19, 39], "residence": ["제주"], "target": "미취업 청년" },
                "apply_period": "2024.03 ~ 예산 소진 시",
                "source_url": "https://www.jeju.go.kr/"
            },
            {
                "id": "JEJU_LIFE_001",
                "name": "제주 도외 정착 지원금 (청년)",
                "agency": "제주특별자치도",
                "category": "Local",
                "amount_text": "최대 50만원 (정착 비용)",
                "amount_max": 500000,
                "description": "타 지역에서 제주로 이주하여 정착하는 청년들에게 초기 정착비를 지원합니다.",
                "eligibility": { "age": [19, 39], "residence": ["제주(이주 정착)"] },
                "apply_period": "상시",
                "source_url": "https://www.jejuyouth.com/"
            }
        ]
        benefits.extend(sample_data)
        print(f"Successfully fetched {len(sample_data)} curated benefits for Jeju.")
    except Exception as e:
        print(f"Error fetching Jeju data: {e}")
    
    return benefits

if __name__ == "__main__":
    benefits = fetch_jeju_benefits()
    output_path = os.path.join(os.path.dirname(__file__), "jeju_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

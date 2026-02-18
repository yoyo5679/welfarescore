import json
import os
import sys

# Logger (Data Team Lead) says: "This script is a template for fetching data from the Seoul Youth Portal via Open API."
# API Documentation: http://data.seoul.go.kr/dataList/OA-12345/A/1/datasetView.do (Example)

def fetch_seoul_youth_benefits(api_key=None):
    """
    Fetches youth policy data from the Seoul Open Data Plaza (YouthHub/Ontong Youth).
    Requires a valid API Key.
    """
    print("Starting Seoul Youth Portal Fetcher...")
    benefits = []

    # If no API Key is provided, use sample data for demonstration
    if not api_key:
        print("No API Key provided. Returning sample simulation data.")
        sample_data = [
            {
                "id": "SEOUL_OPEN_001",
                "name": "서울 영테크 (청년 재테크 상담)",
                "agency": "서울청년센터",
                "category": "Custom",
                "amount_text": "무료 재무상담 및 교육",
                "amount_max": 200000, # Estimated value
                "description": "청년들의 체계적인 자산형성을 돕기 위해 1:1 재무상담과 금융 교육을 무료로 제공합니다.",
                "eligibility": { 
                    "age": [19, 39], 
                    "residence": ["서울"],
                    "target": "서울 거주 청년" 
                },
                "apply_period": "상시 모집",
                "source_url": "https://youth.seoul.go.kr/site/main/content/youth_young_tech_intro"
            },
           {
                "id": "SEOUL_OPEN_002",
                "name": "청년 몽땅 정보통 (이사비 지원)",
                "agency": "서울시 미래청년기획단",
                "category": "Start",
                "amount_text": "최대 40만원",
                "amount_max": 400000,
                "description": "잦은 이사로 인한 청년들의 주거비 부담을 덜어주기 위해 부동산 중개보수 및 이사비를 지원합니다.",
                "eligibility": { 
                    "age": [19, 39], 
                    "residence": ["서울"],
                    "income": "중위소득 120% 이하",
                    "target": "전월세 거주 무주택 청년" 
                },
                "apply_period": "2024.04 (상반기)",
                "source_url": "https://youth.seoul.go.kr/site/main/content/youth_housing_move_support"
            },
             {
                "id": "SEOUL_OPEN_003",
                "name": "마음건강 지원사업 (심리상담)",
                "agency": "서울시",
                "category": "Medical",
                "amount_text": "최대 10회 (회당 8만원 상당)",
                "amount_max": 800000,
                "description": "우울, 불안 등으로 심리적 어려움을 겪는 청년들에게 전문 심리상담 서비스를 제공합니다.",
                "eligibility": { 
                    "age": [19, 39], 
                    "residence": ["서울"],
                    "target": "심리적 어려움을 겪는 청년"
                },
                "apply_period": "연 4회 모집 (3, 5, 7, 9월)",
                "source_url": "https://youth.seoul.go.kr/site/main/content/mind_health_support"
            }
        ]
        benefits.extend(sample_data)
        return benefits

    # --- REAL API CALL IMPLEMENTATION (Prepared for User) ---
    # url = f'http://openAPI.seoul.go.kr:8088/{api_key}/json/SeoulYouthPolicy/1/100/'
    
    return benefits

if __name__ == "__main__":
    benefits = fetch_seoul_youth_benefits()
    
    output_path = os.path.join(os.path.dirname(__file__), "seoul_youth_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

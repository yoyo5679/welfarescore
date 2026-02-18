import json
import os
import sys

# Logger (Data Team Lead) says: "This script is a template for fetching data from the Bokjiro Open API."
# API Documentation: https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15000966

def fetch_bokjiro_benefits(api_key=None):
    """
    Fetches welfare service data from the Ministry of Health and Welfare (Bokjiro).
    Requires a ServiceKey from public data portal (data.go.kr).
    """
    print("Starting Bokjiro Benefit Fetcher...")
    benefits = []

    # If no API Key is provided, use sample data for demonstration
    if not api_key:
        print("No API Key provided. Returning sample simulation data.")
        sample_data = [
            {
                "id": "BOKJIRO_001",
                "name": "긴급복지 생계지원",
                "agency": "보건복지부",
                "category": "Agency",
                "amount_text": "4인 가구 기준 월 183만원",
                "amount_max": 1833500,
                "description": "갑작스러운 위기사유 발생으로 생계유지가 곤란한 저소득 가구에게 생계비를 신속하게 지원합니다.",
                "eligibility": { 
                    "age": [0, 100], 
                    "income": "중위소득 75% 이하",
                    "target": "위기가구" 
                },
                "apply_period": "상시 신청",
                "source_url": "https://www.bokjiro.go.kr/ssis-tbu/twjaa/wlfareInfo/moveTWJAA00005.do?wlfareInfoId=WLF00000060"
            },
           {
                "id": "BOKJIRO_002",
                "name": "청년내일저축계좌",
                "agency": "보건복지부",
                "category": "Custom",
                "amount_text": "3년 만기 시 최대 1,440만원+이자가",
                "amount_max": 14400000,
                "description": "일하는 저소득 청년이 3년간 매월 10만원을 저축하면 정부가 월 10~30만원을 지원합니다.",
                "eligibility": { 
                    "age": [19, 34], 
                    "income": "중위소득 100% 이하",
                    "target": "일하는 청년" 
                },
                "apply_period": "매년 5월경 모집",
                "source_url": "https://www.bokjiro.go.kr/ssis-tbu/twjaa/wlfareInfo/moveTWJAA00005.do?wlfareInfoId=WLF00004663"
            }
        ]
        benefits.extend(sample_data)
        return benefits

    # --- REAL API CALL IMPLEMENTATION (Commented out for safety) ---
    # url = 'http://apis.data.go.kr/B554287/NationalWelfareInformations/NationalWelfarelist'
    # params = {
    #     'serviceKey': api_key,
    #     'callTp': 'L', # L: List, D: Detail
    #     'pageNo': '1',
    #     'numOfRows': '100',
    #     'srchKeyCode': '003' # 001: Title, 002: Content, 003: Title+Content
    # }
    
    return benefits

if __name__ == "__main__":
    # To use real data: fetch_bokjiro_benefits(api_key="YOUR_KEY_HERE")
    benefits = fetch_bokjiro_benefits()
    
    output_path = os.path.join(os.path.dirname(__file__), "bokjiro_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Fetch completed. Saved to {output_path}")

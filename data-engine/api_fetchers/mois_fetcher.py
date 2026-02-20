import urllib.request
import urllib.parse
import urllib.error
import json
import os
import time

# API Configuration
API_KEY= "9a318bb9e3744a79987a64668e6e67c3c8e4fd22b7c261aeddc03af627730a09" 
# For odcloud.kr, the key is often passed as 'serviceKey' query param.
# Note: urllib requires manual encoding if the key has special chars, but this key looks alphanumeric.

BASE_URL = "https://api.odcloud.kr/api/gov24/v1/serviceList"
# Alternative Suggested endpoint: https://api.odcloud.kr/api/15080856/v1/uddi:94175e1c-3086-4hde-993d-82d8d80f6814

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "mois_gov24_data.json")

CATEGORY_MAP = {
    # If category_raw is returned
    "생활안정": "생활비", "주거·자립": "주거", "보육·교육": "교육", 
    "고용·창업": "취업", "행정·안전": "기타", "농림·축산·어업": "기타",
    "문화·예술": "생활비", "건강·의료": "의료",
    # Mapping based on Department (fallback)
    "교육부": "교육",
    "국세청": "생활비",
    "한국주택금융공사": "주거",
    "해양수산부": "취업" # Many fishery supports
}

def fetch_data():
    page = 1
    per_page = 500 # Increased for production data
    all_data = []
    
    print(f"Fetching MOIS Public Service Data with Key: {API_KEY[:5]}...")
    
    # Try Endpoint 1: Generic Gov24 Service List (v3)
    # Research indicates v3 is the latest standard (gov24/v3/serviceList)
    target_url = "https://api.odcloud.kr/api/gov24/v3/serviceList"
    
    # Strategy 1: serviceKey in query param (already tried, failed 400)
    # Strategy 2: Authorization Header (Infuser Key)
    
    params = {
        "page": page,
        "perPage": per_page,
        "serviceKey": API_KEY 
    }
    query_string = urllib.parse.urlencode(params)
    full_url = f"{target_url}?{query_string}"
    
    print(f"Requesting: {full_url}")

    try:
        req = urllib.request.Request(full_url)
        # Add Authorization Header just in case
        # req.add_header("Authorization", f"Infuser {API_KEY}")
        
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            if status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if 'data' in data:
                    print(f"Fetched {len(data['data'])} items (Endpoint 1).")
                    return process_items(data['data'])
    except urllib.error.HTTPError as e:
        print(f"Endpoint 1 failed: {e.code} {e.reason}")
        error_body = e.read().decode('utf-8')
        print(f"Error Body: {error_body}")
            
    except Exception as e:
        print(f"Error fetching MOIS data: {e}")

    # Fallback to Endpoint 2 (15080856) if Endpoint 1 fails
    print("Trying fallback endpoint (15080856)...")
    target_url_2 = "https://api.odcloud.kr/api/15080856/v1/uddi:94175e1c-3086-4hde-993d-82d8d80f6814"
    full_url_2 = f"{target_url_2}?{query_string}"
    
    try:
        req = urllib.request.Request(full_url_2)
        with urllib.request.urlopen(req, timeout=10) as response:
             if response.getcode() == 200:
                data = json.loads(response.read().decode('utf-8'))
                if 'data' in data:
                    items = data['data']
                    print(f"Fetched {len(items)} items from MOIS API (Endpoint 2).")
                    return process_items(items)
    except Exception as e:
        print(f"Fallback failed: {e}")

    return []

def process_items(items):
    processed = []
    for item in items:
        # Map fields (Adjust keys based on actual response if needed)
        svc_name = item.get('서비스명', 'Unknown')
        svc_desc = item.get('서비스목적', '') or item.get('지원내용', '')
        dept_name = item.get('소관기관명', 'GOV24')
        # The Gov24 API V3 returns '지원유형' instead of '분야', and it describes what is supported
        category_raw = item.get('지원유형', '기타')
        # Replace normal URL with a direct Bokjiro Search URL
        encoded_name = urllib.parse.quote(svc_name)
        url = f"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do?searchWrd={encoded_name}"
        
        # Determine internal V13 category mapping based on '지원유형'
        if '의료' in category_raw: my_category = '의료'
        elif '교육' in category_raw: my_category = '교육'
        elif '돌봄' in category_raw: my_category = '육아'
        elif '주거' in svc_desc or '주거' in svc_name or '전세' in svc_name or '월세' in svc_name: my_category = '주거'
        elif '일자리' in category_raw or '고용' in svc_name or '취업' in svc_name: my_category = '취업'
        else: my_category = '생활비'
        
        converted = {
            "name": svc_name,
            "description": svc_desc,
            "icon": "🇰🇷",
            "agency": dept_name, # Changed from 'tag' to meet schema
            "tag": dept_name, # Keep tag just in case
            "applyUrl": url,
            "category": my_category, # Internal use V13 format
            "raw_category": category_raw, # Debugging
            "relevance": 80, 
            "amount_max": 0, # Changed from monthlyAmount
            "condition": "true" 
        }
        processed.append(converted)
    return processed

if __name__ == "__main__":
    results = fetch_data()
    if results:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(results)} items to {OUTPUT_FILE}")
    else:
        print("No data fetched.")

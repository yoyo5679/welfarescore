import urllib.request
import urllib.parse
import json

API_KEY= "9a318bb9e3744a79987a64668e6e67c3c8e4fd22b7c261aeddc03af627730a09" 
target_url = "https://api.odcloud.kr/api/gov24/v3/serviceList"

params = {
    "page": 1,
    "perPage": 50,
    "serviceKey": API_KEY 
}
query_string = urllib.parse.urlencode(params)
full_url = f"{target_url}?{query_string}"

try:
    req = urllib.request.Request(full_url)
    with urllib.request.urlopen(req, timeout=10) as response:
         if response.getcode() == 200:
            data = json.loads(response.read().decode('utf-8'))
            if 'data' in data:
                items = data['data']
                print(f"Fetched {len(items)} items")
                categories = set()
                targets = set()
                for i in items:
                    categories.add(i.get('지원유형', '없음'))
                    targets.add(i.get('소관기관명', '없음'))
                print("Categories:", list(categories))
except Exception as e:
    print("Error:", e)

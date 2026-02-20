import urllib.request
import urllib.parse
import json

API_KEY= "9a318bb9e3744a79987a64668e6e67c3c8e4fd22b7c261aeddc03af627730a09" 
target_url = "https://api.odcloud.kr/api/gov24/v3/serviceList"

params = {"page": 1,"perPage": 200,"serviceKey": API_KEY}
query_string = urllib.parse.urlencode(params)

try:
    req = urllib.request.Request(f"{target_url}?{query_string}")
    with urllib.request.urlopen(req, timeout=10) as response:
         if response.getcode() == 200:
            data = json.loads(response.read().decode('utf-8'))
            categories = set()
            for i in data['data']:
                categories.add(i.get('지원유형', '없음'))
            print("Gov24지원유형:", list(categories))
            
            bunya = set()
            for i in data['data']:
                bunya.add(i.get('분야', '없음'))
            print("Gov24분야:", list(bunya))
except Exception as e:
    print("Error:", e)

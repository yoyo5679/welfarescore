import urllib.request
import urllib.parse
import json

url = 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/selectWlfareInfo.do'
data = urllib.parse.urlencode({'pageUnit': 10, 'pageIndex': 1, 'searchWrd': ''}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': 'Mozilla/5.0',
    'Content-Type': 'application/x-www-form-urlencoded'
})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        content = response.read().decode('utf-8')
        print("Response length:", len(content))
        if content.strip().startswith('{'):
            data = json.loads(content)
            print("Keys:", data.keys())
            if 'dsNatList' in data:
                print("Items found:", len(data['dsNatList']))
                if len(data['dsNatList']) > 0:
                    print(data['dsNatList'][0])
except Exception as e:
    print("Error:", e)

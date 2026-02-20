import requests
import json

url = 'https://www.bokjiro.go.kr/ssis-tbu/oapi/wlfareInfo/moveTWAT52005M.do'

headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': 'Mozilla/5.0'
}

data = {
    'searchSralId': '',
    'srchKeyCode': ''
}

try:
    # Just try to get any JSON response to see if they expose a list of categories
    # The actual search API is usually on a different endpoint like selectWlfareInfo.do
    # Let's try to query the main list API that Bokjiro uses.
    
    test_url = 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/selectWlfareInfo.do'
    payload = {
        'pageUnit': 10,
        'pageIndex': 1,
        'searchWrd': ''
    }
    
    res = requests.post(test_url, headers=headers, data=payload, verify=False, timeout=10)
    print("Response Length:", len(res.text))
    
    if res.text.strip().startswith('{'):
        info = json.loads(res.text)
        print("Keys:", info.keys())
    else:
        print("Not JSON")
        
except Exception as e:
    print("Error:", e)

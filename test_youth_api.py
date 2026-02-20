import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

url = "https://www.youthcenter.go.kr/opi/youthPlcyList.do"
key = "c3da64b8-48a4-4139-9fe5-5e78ebed242f"

params = {
    "openApiVlak": key,
    "display": 10,
    "pageIndex": 1
}

query_string = urllib.parse.urlencode(params)
full_url = f"{url}?{query_string}"
print("Fetching from:", full_url)

req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        content = response.read().decode('utf-8')
        print("Response length:", len(content))
        if "<emp>" in content:
            print("Successfully found data!")
        else:
            print("No <emp> tag found. Content start:")
            print(content[:200])
except Exception as e:
    print("Error:", e)

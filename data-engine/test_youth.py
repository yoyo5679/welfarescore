import urllib.request
import urllib.parse

url = "https://www.youthcenter.go.kr/opi/youthPlcyList.do?openApiVlak=c3da64b8-48a4-4139-9fe5-5e78ebed242f&display=2&pageIndex=1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        content = response.read()
        print(content[:1000])
except Exception as e:
    print("Error:", e)

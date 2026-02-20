import urllib.request
import xml.etree.ElementTree as ET

url = "https://www.youthcenter.go.kr/opi/youthPlcyList.do?openApiVlak=c3da64b8-48a4-4139-9fe5-5e78ebed242f&display=10&pageIndex=1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        print(content[:500])
        root = ET.fromstring(content)
        emps = root.findall('.//emp')
        print(f"Found {len(emps)} emp tags.")
        if len(emps) > 0:
            for child in emps[0]:
                print(f"  {child.tag}: {child.text[:50] if child.text else ''}")
except Exception as e:
    print("Error:", e)

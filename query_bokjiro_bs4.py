import urllib.request
from bs4 import BeautifulSoup
import ssl

url = "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do"

try:
    context = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, context=context).read()
    soup = BeautifulSoup(html, 'html.parser')

    # Bokjiro uses JavaScript to render, so the raw HTML might not have the fully populated selects
    # Let's search for keywords like '주거', '취업', '임신', '출산', '교육' in any elements
    
    keywords = ['주거', '취업', '의료', '육아', '교육', '생활', '임신', '출산', '서민금융', '일자리']
    
    found = set()
    for text in soup.stripped_strings:
        for k in keywords:
            if k in text:
                found.add(text)
                
    print("Found matching strings in HTML:")
    for f in list(found)[:20]:
        print("-", f)
        
    print("\nTotal HTML length:", len(html))

except Exception as e:
    print("Error:", e)

import urllib.request
import urllib.parse
import re
import json
import os
import time

# --- CONFIGURATION ---
TARGETS = [
    {
        "name": "gwanak",
        "url": "https://www.gwanak.go.kr/site/gwanak/ex/bbs/List.do?cbIdx=239",
        "base_url": "https://www.gwanak.go.kr/site/gwanak/ex/bbs/"
    }
    # Add other Green List districts here (e.g., Jongno)
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
}

# Regex for common Gov sites (e.g., View.do?idx=...)
LINK_PATTERN = re.compile(r'<a\s+href="([^"]+View\.do[^"]+)"[^>]*>\s*(.*?)\s*</a>', re.IGNORECASE | re.DOTALL)

# Keyword Categories
CATEGORY_MAP = {
    "Housing": ["월세", "전세", "보증금", "주택", "이사", "부동산", "집수리"],
    "Job": ["일자리", "취업", "인턴", "채용", "근로", "창업", "구직"],
    "Living": ["수당", "지원금", "생계", "바우처", "급여", "교통비"],
    "Medical": ["심리", "상담", "건강", "검진", "병원", "치료"],
    "Culture": ["문화", "예술", "축제", "강좌", "교육", "학습"],
    "Finance": ["대출", "융자", "적금", "자산", "금융"]
}

def clean_html(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def determine_category(title):
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in title for k in keywords):
            return cat
    return "General" # Default

def run_crawler():
    print("Starting District Crawler...")
    all_benefits = []
    
    for district in TARGETS:
        print(f"Crawling {district['name']}...")
        try:
            req = urllib.request.Request(district['url'], headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8')
                matches = LINK_PATTERN.findall(html)
                
                print(f"  Found {len(matches)} raw links.")
                
                for link, raw_title in matches:
                    title = clean_html(raw_title)
                    
                    # Filter: Only keep items with relevant keywords to reduce noise
                    category = determine_category(title)
                    # if category == "General": continue # Optional: Skip unrelated items? Let's keep them for now but maybe mark them.
                    
                    # Construct full link
                    # Fix for relative paths:
                    if link.startswith("/"):
                        full_link = f"https://www.gwanak.go.kr{link}"
                    elif not link.startswith("http"):
                         # Clean up any ./ or ../ if present (simple replace)
                         clean_link = link.replace("./", "") 
                         full_link = f"{district['base_url']}{clean_link}"
                    else:
                        full_link = link

                    # Calculate Amount (Heuristic: extract numbers followed by '만원')
                    amount = 0
                    amt_match = re.search(r'(\d+,?\d*)만?원', title)
                    if amt_match:
                        try:
                            num_str = amt_match.group(1).replace(",", "")
                            amount = int(num_str) * 10000
                        except:
                            pass

                    item = {
                        "id": f"CRAWL_{district['name']}_{hash(title)}",
                        "name": title,
                        "description": f"[{district['name']}청 수집] {title}",
                        "icon": "🏛️",
                        "agency": f"{district['name']}청",
                        "tag": f"{district['name']}청 (자동수집)",
                        "applyUrl": full_link,
                        "apply_period": "공고 확인",
                        "howTo": ["홈페이지 방문", "담당부서 문의"],
                        "condition": f"d.region === 'seoul' && d.subRegion === '{district['name']}'", # Dynamic logic string
                        "relevance": 90,
                        "monthlyAmount": amount,
                        "category": category # Internal use
                    }
                    all_benefits.append(item)
                    print(f"    + [{category}] {title}")
                    
        except Exception as e:
            print(f"❌ Error crawling {district['name']}: {e}")
            
    return all_benefits

if __name__ == "__main__":
    benefits = run_crawler()
    output_path = os.path.join(os.path.dirname(__file__), "api_fetchers", "district_crawled_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benefits, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(benefits)} items to {output_path}")

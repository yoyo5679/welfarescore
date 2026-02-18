import urllib.request
import urllib.parse
import re
import json
import os
import time

# Target: Gwanak-gu Notice Board
# URL found via search: https://www.gwanak.go.kr/site/gwanak/ex/bbs/List.do?cbIdx=239 (Standard Gov format often looks like this, let's try the JSP one too if needed)
# But let's try the standard pattern first if the JSP is a wrapper.
# Actually, let's try the JSP link first since that was the search result:
# https://www.gwanak.go.kr/site/gwanak/04/10404010000002015091702.jsp

TARGET_URL = "https://www.gwanak.go.kr/site/gwanak/ex/bbs/List.do?cbIdx=239" 
# Note: cbIdx=239 is a guess based on common gov patterns, but let's stick to the search result if possible. 
# Search result: https://www.gwanak.go.kr/site/gwanak/04/10404010000002015091702.jsp
# Let's try to fetch the JSP one, usually it includes the list or redirects.
REAL_TARGET_URL = "https://www.gwanak.go.kr/site/gwanak/ex/bbs/List.do?cbIdx=239" # I will assume standard board ID for now or try to discover it.
# Actually, to be safe, let's use the one from search result and see if it works.
TEST_URL = "https://www.gwanak.go.kr/site/gwanak/ex/bbs/List.do?cbIdx=239"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
}

KEYWORDS = ["청년", "지원", "수당", "월세", "대출", "장학금", "일자리"]

def clean_html(raw_html):
    """Remove standard HTML tags."""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def run_crawler():
    print(f"Crawler started for {TEST_URL}...")
    try:
        req = urllib.request.Request(TEST_URL, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            # Debug: Print first 500 chars to see if it's valid
            # print(html[:500])
            
            # Simple Regex to find table rows (Standard gov board usually has <tbody>...<tr>...)
            # Look for titles in <a> tags inside <td>
            # Pattern: <td class="subject">...<a href="...">Title</a>
            
            # Regex to capture link and title
            # This is fragile but "Universal Prototype".
            # Matches: <a href="View.do?..." ... > Title </a>
            link_pattern = re.compile(r'<a\s+href="([^"]+View\.do[^"]+)"[^>]*>\s*(.*?)\s*</a>', re.IGNORECASE | re.DOTALL)
            
            matches = link_pattern.findall(html)
            
            crawled_data = []
            
            print(f"Found {len(matches)} generic links. Filtering...")
            
            for link, raw_title in matches:
                title = clean_html(raw_title)
                
                # Check keywords
                if any(k in title for k in KEYWORDS):
                    full_link = f"https://www.gwanak.go.kr/site/gwanak/ex/bbs/{link}" if not link.startswith("http") else link
                    
                    item = {
                        "region": "seoul",
                        "subRegion": "gwanak",
                        "title": title,
                        "link": full_link,
                        "crawled_at": time.strftime("%Y-%m-%d")
                    }
                    crawled_data.append(item)
                    print(f"  [MATCH] {title}")
            
            # Categorize logic (Simulated for Prototype)
            final_benefits = []
            for item in crawled_data:
                benefit = {
                    "name": item["title"],
                    "description": f"관악구청 공지사항에서 수집된 정보입니다. 원문에서 상세 내용을 확인하세요.",
                    "icon": "🏛️", 
                    "tag": "관악구청(수집됨)",
                    "applyUrl": item["link"],
                    "apply_period": "공고 확인",
                    "howTo": ["관악구청 홈페이지 확인"],
                    "condition": "gwanak_resident_match", # placeholder function
                    "relevance": 90,
                    "monthlyAmount": 0 # Unknown
                }
                final_benefits.append(benefit)
                
            return final_benefits

    except Exception as e:
        print(f"Crawler Error: {e}")
        return []

if __name__ == "__main__":
    benefits = run_crawler()
    
    if benefits:
        output_path = os.path.join(os.path.dirname(__file__), "gwanak_crawled_data.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(benefits, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(benefits)} items to {output_path}")
    else:
        print("No benefits found or crawler failed.")

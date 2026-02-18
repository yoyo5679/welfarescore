import urllib.request
import urllib.error
from urllib.parse import urlparse

# List of target district offices (Seoul)
targets = [
    {"name": "Mapo-gu", "url": "https://www.mapo.go.kr"},
    {"name": "Gangnam-gu", "url": "https://www.gangnam.go.kr"},
    {"name": "Seocho-gu", "url": "https://www.seocho.go.kr"},
    {"name": "Songpa-gu", "url": "https://www.songpa.go.kr"},
    {"name": "Yongsan-gu", "url": "https://www.yongsan.go.kr"},
    {"name": "Seongdong-gu", "url": "https://www.sd.go.kr"},
    {"name": "Yeongdeungpo-gu", "url": "https://www.ydp.go.kr"},
    {"name": "Gwanak-gu", "url": "https://www.gwanak.go.kr"},
    {"name": "Jongno-gu", "url": "https://www.jongno.go.kr"},
    {"name": "Jung-gu", "url": "https://www.junggu.seoul.kr"}
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
}

def check_robots(target):
    name = target["name"]
    base_url = target["url"]
    robots_url = f"{base_url}/robots.txt"
    
    try:
        req = urllib.request.Request(robots_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            content = response.read().decode('utf-8')
            
            print(f"[{name}] {robots_url} -> Status: {status}")
            print(f"--- CONTENT START ({name}) ---")
            print(content[:300]) # First 300 chars
            print(f"--- CONTENT END ({name}) ---")
            
            # Simple check for Disallow: /
            if "Disallow: /" in content and "User-agent: *" in content:
                print(f"⚠️  {name} explicitly DISALLOWS scraping.")
            else:
                print(f"✅ {name} might allow scraping (Check paths manually).")
                
    except urllib.error.HTTPError as e:
        print(f"[{name}] {robots_url} -> HTTP Error: {e.code}")
    except Exception as e:
        print(f"❌ {name} Error: {e}")
    print("-" * 50)

if __name__ == "__main__":
    print("Starting Ethics Check for District Offices...")
    for t in targets:
        check_robots(t)

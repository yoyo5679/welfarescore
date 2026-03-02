import json, re, os

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)

print("=" * 50)
print("  API별 수집 데이터 개수 현황")
print("=" * 50)

# 1. unified_welfare_data.json (병합 전 원본)
with open(os.path.join(BASE, 'unified_welfare_data.json'), 'r', encoding='utf-8') as f:
    unified = json.load(f)
sources = {}
for item in unified:
    src = item.get('source', '알수없음')
    sources[src] = sources.get(src, 0) + 1
print(f"\n[unified_welfare_data.json] 총 {len(unified)}개")
for src, cnt in sorted(sources.items(), key=lambda x: -x[1]):
    print(f"  - {src:30} {cnt}개")

# 2. api_fetchers 폴더별 raw 데이터
print(f"\n[api_fetchers/ 개별 원본 파일]")
fetcher_dir = os.path.join(BASE, 'api_fetchers')
for fname in sorted(os.listdir(fetcher_dir)):
    if fname.endswith('.json') and not fname.startswith('.'):
        fpath = os.path.join(fetcher_dir, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            count = len(data) if isinstance(data, list) else '(dict)'
            print(f"  - {fname:40} {count}개")
        except Exception as e:
            print(f"  - {fname:40} 오류: {e}")

# 3. 복지로 공식 데이터 (오늘 수집)
with open(os.path.join(BASE, 'bokjiro_official_data.json'), 'r', encoding='utf-8') as f:
    bokjiro = json.load(f)
print(f"\n[bokjiro_official_data.json] 총 {len(bokjiro)}개 (오늘 복지로 API 수집)")

# 4. 최종 generated_data.js
with open(os.path.join(ROOT, 'generated_data.js'), 'r', encoding='utf-8') as f:
    js_content = f.read()
js_count = len(re.findall(r"name: '[^']+'", js_content))
print(f"\n[generated_data.js - 최종 앱에 로드되는 수] 총 {js_count}개")

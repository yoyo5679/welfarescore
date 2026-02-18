import json
import os

# Logger (Data Team Lead) says: "Final integration step. Merging all 8 regions."

def merge_all_data():
    base_dir = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/api_fetchers"
    regions = [
        # "seoul", "incheon", "gyeonggi", "jeolla", "chungcheong", "gyeongsang", "jeju", "gangwon",
        # "bokjiro", "seoul_youth", "district_crawled",
        "mois_gov24"
    ]
    
    all_benefits = []
    
    for region in regions:
        file_path = os.path.join(base_dir, f"{region}_data.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                all_benefits.extend(data)
                print(f"Merged {len(data)} benefits from {region}")
        else:
            print(f"Warning: {file_path} not found.")

    output_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/unified_welfare_data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_benefits, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully created unified data at {output_path}")

if __name__ == "__main__":
    merge_all_data()

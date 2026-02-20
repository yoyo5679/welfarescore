import json
import os
import csv
from collections import Counter

# Load raw MOIS data
# Assuming data-engine/api_fetchers/mois_gov24_data.json
file_path = "data-engine/api_fetchers/mois_gov24_data.json"

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit()

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Extract key fields that contain categorization information
category_counter = Counter()
service_purpose_counter = Counter()
support_type_counter = Counter()

bokjiro_life = []
bokjiro_household = []
bokjiro_topic = []

for item in data:
    category_counter[item.get('category', '없음')] += 1
    support_type_counter[item.get('raw_category', '없음')] += 1
   
    # Target (e.g., 소상공인, 임산부) mapping
    svc_name = item.get('name', '')
    svc_desc = item.get('description', '')
    combined_text = svc_name + " " + svc_desc
    
    # 1. 생애주기
    if '임산부' in combined_text or '임신' in combined_text or '출산' in combined_text: bokjiro_life.append('임신·출산')
    if '영유아' in combined_text or '어린이집' in combined_text: bokjiro_life.append('영유아')
    if '청년' in combined_text or '대학생' in combined_text: bokjiro_life.append('청년')
    if '노인' in combined_text or '어르신' in combined_text or '고령' in combined_text: bokjiro_life.append('노년')
    
    # 2. 가구상황
    if '저소득' in combined_text or '기초생활' in combined_text or '차상위' in combined_text: bokjiro_household.append('저소득')
    if '장애인' in combined_text: bokjiro_household.append('장애인')
    if '한부모' in combined_text or '조손' in combined_text: bokjiro_household.append('한부모·조손')
    if '다자녀' in combined_text: bokjiro_household.append('다자녀')
    if '다문화' in combined_text or '북한' in combined_text: bokjiro_household.append('다문화·탈북민')
    if '보훈' in combined_text or '국가유공자' in combined_text: bokjiro_household.append('보훈대상자')
    
    # 3. 관심주제
    support_type = item.get('raw_category', '')
    if '신체건강' in support_type or '의료' in support_type: bokjiro_topic.append('신체건강')
    if '정신건강' in support_type or '심리' in combined_text: bokjiro_topic.append('정신건강')
    if '생활지원' in support_type or '생활안정' in support_type: bokjiro_topic.append('생활지원')
    if '주거' in support_type or '전세' in combined_text or '월세' in combined_text: bokjiro_topic.append('주거')
    if '일자리' in support_type or '고용' in support_type or '창업' in support_type: bokjiro_topic.append('일자리')
    if '문화' in support_type or '예술' in support_type: bokjiro_topic.append('문화·여가')
    if '보육' in support_type or '교육' in support_type: bokjiro_topic.append('보육/교육')
    if '서민금융' in support_type or '대출' in combined_text: bokjiro_topic.append('서민금융')
    
    # We can also extract keywords from '목적' or '이름' but let's stick to explicit fields first.

# Bokjiro Categories
# 1. 생애주기: 임신·출산, 영유아, 아동, 청소년, 청년, 중장년, 노년
# 2. 가구상황: 저소득, 장애인, 한부모·조손, 다자녀, 다문화·탈북민, 보훈대상자
# 3. 관심주제: 신체건강, 정신건강, 생활지원, 주거, 일자리, 문화·여가, 안전·위기, 임신·출산, 보육, 교육, 입양·위탁, 보호·돌봄, 서민금융, 법률, 에너지

# Create a Markdown report
report_lines = []
report_lines.append("# Welfare Data Bokjiro Category Mapping Report\n")
report_lines.append("This report maps the 500 items from the actual government API into the exact 3-column system used by Bokjiro.\n")

report_lines.append("## 1. 생애주기 (Life Cycle)")
for k, v in Counter(bokjiro_life).most_common():
    report_lines.append(f"- **{k}**: {v} 건 매칭")

report_lines.append("\n## 2. 가구상황 (Household Situation)")
for k, v in Counter(bokjiro_household).most_common():
    report_lines.append(f"- **{k}**: {v} 건 매칭")

report_lines.append("\n## 3. 관심주제 (Topic of Interest)")
for k, v in Counter(bokjiro_topic).most_common():
    report_lines.append(f"- **{k}**: {v} 건 매칭")

# Save Markdown
report_md_path = "data-engine/Bokjiro_Hashtag_Report.md"
with open(report_md_path, "w", encoding="utf-8") as f:
    f.write("\n".join(report_lines))

# Save to CSV (Excel compatible)
csv_path = "data-engine/Bokjiro_Hashtag_Report.csv"
with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Bokjiro Column", "Hashtag", "Match Count"])
    
    for k, v in Counter(bokjiro_life).most_common():
        writer.writerow(["생애주기", k, v])
        
    for k, v in Counter(bokjiro_household).most_common():
        writer.writerow(["가구상황", k, v])
        
    for k, v in Counter(bokjiro_topic).most_common():
        writer.writerow(["관심주제", k, v])

print(f"Analysis saved to {report_md_path} and {csv_path}")

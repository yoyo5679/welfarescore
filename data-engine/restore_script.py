import os

bak_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/script.js.bak"
target_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/script.js"

with open(bak_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Read the new data
gen_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/data-engine/generated_data.js"
with open(gen_path, 'r', encoding='utf-8') as f:
    new_data = f.read()

# Ensure it ends with a newline
if not new_data.endswith('\n'):
    new_data += '\n'

# 2. Find the start of the functions
# Search for 'function selectOption'
func_start_idx = -1
for i, line in enumerate(lines):
    if "function selectOption" in line:
        func_start_idx = i
        break

if func_start_idx == -1:
    print("Error: selectOption not found in backup.")
    exit(1)

# Include the comment before it if exists
if lines[func_start_idx-1].strip().startswith('//'):
    func_start_idx -= 1

func_block = lines[func_start_idx:]

print(f"Restoring. Data: {len(new_data.splitlines())} lines. Funcs start at line {func_start_idx+1} ({len(func_block)} lines).")

# 3. Combine
# We need to make sure 'answers' and other globals are preserved if they were in the replaced block.
# Checking script.js.bak, 'const answers = {};' was at line 1.
# generated_data.js only has welfareData.
# So we must recreate the header.

header = """const answers = {};
const TOTAL_STEPS = 5;

// 시군구 데이터 (V11)
const SUB_REGIONS = {
    'seoul': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    'gyeonggi': ['수원시', '고양시', '용인시', '성남시', '부천시', '화성시', '안산시', '남양주시', '안양시', '평택시', '시흥시', '파주시', '의정부시', '김포시', '광주시', '광명시', '군포시', '하남시', '오산시', '양주시', '이천시', '구리시', '안성시', '포천시', '의왕시', '여주시', '양평군', '동두천시', '과천시', '가평군', '연천군'],
    'busan': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    'incheon': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    'daegu': ['군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    'gwangju': ['광산구', '남구', '동구', '북구', '서구'],
    'daejeon': ['대덕구', '동구', '서구', '유성구', '중구'],
    'ulsan': ['남구', '동구', '북구', '울주군', '중구'],
    'sejong': ['세종시'],
    'gangwon': ['춘천시', '원주시', '강릉시', '동해시', '속초시', '홍천군', '횡성군', '영월군', '평창군'],
    'chungbuk': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
    'chungnam': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'],
    'jeonbuk': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군'],
    'jeonnam': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군'],
    'gyeongbuk': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시'],
    'gyeongnam': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
    'jeju': ['제주시', '서귀포시']
};

// 소득 기준 데이터 (2026년 예정치 기준)
const MEDIAN_INCOME_2026 = { 1: 2564238, 2: 4199292, 3: 5359036, 4: 6494738, 5: 7556719, 6: 8555952 };

"""
new_content = [header, new_data] + func_block

with open(target_path, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("Restoration complete.")

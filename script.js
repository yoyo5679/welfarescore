const answers = {};
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

const welfareData = [
    {
        name: '유아학비 (누리과정) 지원',
        description: '○ 3~5세에 대해 교육비를 지급합니다.\r\n  - 국공립 100,000원, 사립 280,000원\r\n\r\n○ 3~5세에 대해 방과후과정비를 지급합니다.\r\n   - 국공립 50,000원, 사립 70,000원\r\n\r\n○ 사립유치원을 다니는 법정저소득층 유아에게 저소득층 유아학비를 추가 지급합니다.\r\n   - 사립 200,000원',
        icon: '💎', tag: '교육부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/000000465790',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '육아',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '근로·자녀장려금',
        description: '○ 전년도 연간 부부합산 총 급여액 등(근로소득, 사업소득 또는 종교인소득의 합계)에 따라\r\n - 근로장려금은\r\n  ㆍ 단독가구 최대 165만 원\r\n  ㆍ 홑벌이 가구 최대 285만 원\r\n  ㆍ 맞벌이 가구 최대 330만 원 지급\r\n - 자녀 장려금은\r\n  ㆍ 단독가구 해당 없음\r\n  ㆍ 홑벌이 가구 부양자녀 1명 당 최대 100만 원\r\n  ㆍ 맞벌이 가구 부양자녀 1명 당 최대 100만 원 지급\r\n\r\n* 자세한 산정식은 홈택스(www.hometax.go.kr)에서 확인 바랍니다',
        icon: '💎', tag: '국세청',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/105100000001',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '취업',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '주택금융공사 월세자금보증',
        description: '○ 주택도시기금 주거안정 월세대출 요건을 충족하는 대상자에 대해 월세자금보증 지원\r\n -  최대 1,152만원 이내에서 월세금을 2년 환산한 금액의 80%까지 대출금액의 80%를 공사가 보증',
        icon: '💎', tag: '한국주택금융공사',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/116010000001',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '주거',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '친환경 에너지절감장비 보급',
        description: '○  고효율 등(燈)(LED, 무전극등(燈) 등)\r\n○  노후화된 기관(디젤, 가솔린기관 등)\r\n○  에너지 절감이 가능한 유류절감장치 \r\n○  대기오염 방지 및 탄소배출 절감이 가능한 매연저감장치 등',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000001',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '해양사고 국선 심판변론인 선정 지원',
        description: '○ 해양사고관련자가 심판원에 대하여 하는 신청ㆍ청구ㆍ진술 등의 대리 또는 대행\r\n\r\n○ 해양사고관련자에 대하여 하는 해양사고와 관련된 기술적 자문',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000007',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '옵서버 승선경비 지원',
        description: '○ 원양어선에 승선하여 활동하는 국제옵서버 승선경비 및 활동 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000008',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '합작수산물 관세 감면 추진',
        description: '○ 관세감면',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000010',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '귀어 창업 및 주택구입 지원(융자)',
        description: '○ 지원대상자로 선정된 자가 사업(일부완료 또는 완료) 후 담보(신용, 물건)를 제공하고, 금융기관(수협은행)에서 융자를 받으면, 해양수산부에서 이자 차이(기준금리-대출금리 1.5%)를 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000012',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '주거',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '원양어업 경영자금 지원',
        description: '○ 어업경영자금 융자(수협은행)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000016',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '원양어선안전관리',
        description: '○ 원양어선의 안전성 확보와 어선원 복지 증진을 위해 안전펀드를 조성하여 노후 원양어선의 대체 및 건조를 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000022',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '산지 및 소비지 유통자금 융자 지원',
        description: '○ 산지위판장 및 수산물 도매시장 어대금 결제자금, 직거래 자금 등  융자지원(금리 1.5~3%)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000027',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '수산경영인회생자금',
        description: '○ 수산업경영회생자금 지원(5년 거치, 7년 균분 상환/ 융자금리 1%)\r\n -  지원대상자금: 상환기일이 도래하였거나 향후 도래할 수협은행 대출금의 원리금, 어업시설 개·보수 자금, 업종별 1회전 운영자금 등',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000044',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '주거',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '어업경영자금 지원',
        description: '○ 어업경영자금 융자(수협은행 및 단위수협)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000045',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: 'TAC 참여어업인 경영개선자금 지원',
        description: '○ TAC 참여 어업인 대상 경영개선자금 지원(융자)\r\n - 융자 100%\r\n - 고정금리 연 2.5%~3.0%, 변동금리(매월 고시)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000053',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '연안선박 현대화 지원',
        description: '○ 연안 선박 건조를 위한 금융기관 대출이자를 단순 신조인 경우 2.0, 노후선박 대체 또는 친환경선 도입(개조) 인 경우 2.5% 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000055',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '주거',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '안전복지형 연근해어선 기반구축',
        description: '○ 연근해어업의 허가를 받은 어선 중 선령 15년 이상 노후어선을 어선원 안전복지 및 에너지 절감 등을 고려한 현대화어선으로 대체 건조',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000056',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '생활비',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '어업활동 지원',
        description: '최대 12만원(국비 50%, 지방비 30%, 자부담 20%), 1인당 최대 30일(단, 4대중증질환 및 임심출산가구는 최대60일)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000059',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '육아',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '어업인 역량 강화 교육 지원',
        description: '○ 어업인 혹은 어업인 단체의 역량강화 교육\r\n\r\n○ 여성어업인, 다문화가정 여성어업인 대상 역량 강화\r\n\r\n○ 어업인, 수산업경영인, 해양수산신지식인 대상 역량강화\r\n\r\n○ 어업인 등 국내외 시장개척을 위한 박람회 참가, 벤치마킹, 기술교류 활동, 학술대회 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000066',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '교육',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '어업인안전조업교육지원',
        description: '○ ‘어선안전조업법’의 법정교육으로 연 1회(4시간) 어선의 선주, 선장, 기관장, 통신장 등 직무대행자에게 실시하는 안전조업교육\r\n- 어업인 안전조업교육지원을 위한 민간위탁보조 지원',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000067',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '취업',
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '창업어가멘토링지원',
        description: '○ 후견인이 창업어가에게 기술, 경영 측면 등에 대한 교육 지도 등 제공(창업어가 1인당 월 60만원 한도 지원)',
        icon: '💎', tag: '해양수산부',
        applyUrl: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/119200000070',
        apply_period: '',
        howTo: ['상세 공고 확인', '온라인/방문 신청'],
        condition: (d) => true,
        category: '취업',
        relevance: 95, monthlyAmount: 0
    },
];
// 옵션 선택
function selectOption(el, key) {
    const parent = el.closest('.options');
    parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    answers[key] = el.dataset.val;

    // 지역 선택 시 시군구 인터랙션 (V11)
    if (key === 'region') {
        const subArea = document.getElementById('subRegionArea');
        const subOpts = document.getElementById('subRegionOptions');
        const regionKey = el.dataset.val;

        // 시군구 데이터가 있으면 렌더링
        if (SUB_REGIONS[regionKey] && SUB_REGIONS[regionKey].length > 0) {
            subOpts.innerHTML = ''; // 초기화
            SUB_REGIONS[regionKey].forEach(sub => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.textContent = sub;
                btn.onclick = function () { selectOption(this, 'subRegion'); };
                subOpts.appendChild(btn);
            });
            subArea.style.display = 'block';

            // 다음 버튼 비활성화 (시군구 선택 대기) -> 세종시 같은 예외가 있다면 자동 선택 고려 가능하나 일단 선택 강제
            const stepNum = el.closest('.step').id.replace('step-', '');
            const btn = document.getElementById('next' + stepNum);
            if (btn) btn.disabled = true;

            // 세종 같은 단일 항목은 자동 선택 처리 (User Friendly)
            if (SUB_REGIONS[regionKey].length === 1) {
                subOpts.firstChild.click();
            }
            return; // 시군구 선택 후 버튼 활성화를 위해 리턴
        } else {
            // 시군구 데이터 없으면 숨김
            subArea.style.display = 'none';
        }
    }

    // 시군구 선택 시 스크롤 부드럽게
    if (key === 'subRegion') {
        // 시군구 선택됨 -> 다음 버튼 활성화 로직으로 이동
    }

    const stepNum = el.closest('.step').id.replace('step-', '');
    const btn = document.getElementById('next' + stepNum);
    if (btn) btn.disabled = false;
}

// 다음 스텝
function nextStep(num) {
    const current = num - 1;
    document.getElementById('step-' + current).classList.remove('active');
    document.getElementById('step-' + num).classList.add('active');
    updateProgress(current);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // History API 연동 (뒤로가기 지원)
    history.pushState({ step: num }, '', '#step-' + num);
}

// 이전 스텝 (V9)
function prevStep(num) {
    document.querySelector('.step.active').classList.remove('active');
    document.getElementById('step-' + num).classList.add('active');
    updateProgress(num - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 브라우저 뒤로가기 감지 (V9)
window.onpopstate = function (event) {
    const step = event.state ? event.state.step : 1;
    const activeStep = document.querySelector('.step.active');
    if (activeStep) activeStep.classList.remove('active');

    // 결과 화면에서 뒤로가기 시 5단계로
    if (step === 'result') {
        document.getElementById('step-result').classList.add('active');
    } else if (step === 'loading') {
        document.getElementById('step-loading').classList.add('active');
    } else {
        const target = document.getElementById('step-' + step);
        if (target) target.classList.add('active');
        updateProgress(step - 1);
    }
};

// 초기 상태 설정
history.replaceState({ step: 1 }, '', '#step-1');

// 진행바 업데이트
function updateProgress(completed) {
    const pct = (completed / TOTAL_STEPS) * 100;
    const bar = document.getElementById('progressBar');
    const label = document.getElementById('progressLabel');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = completed + ' / ' + TOTAL_STEPS + ' 완료';
}

// 로딩 시작
function startLoading() {
    document.getElementById('step-5').classList.remove('active');
    document.getElementById('step-loading').classList.add('active');
    updateProgress(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    history.pushState({ step: 'loading' }, '', '#loading');

    const loadingIds = ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'];
    loadingIds.forEach((id, i) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.classList.add('show');
            if (i === 4) setTimeout(showResult, 800);
        }, 500 + i * 600);
    });
}

// 결과 데이터 계산 (V12 점수 로직 업그레이드)
function calcResult() {
    let matched = [];
    let totalAmount = 0;

    // 1. 기본 점수 (30~50점 랜덤) - 변별력 확보
    let baseScore = Math.floor(Math.random() * 21) + 30;
    
    // 2. 소득/가구별 필요도 점수 (복지 시급성)
    let needScore = 0;
    // 소득 점수: 낮을수록 높음
    if (answers.income === '100만원미만') needScore += 30;
    else if (answers.income === '100-250만원') needScore += 15;
    else if (answers.income === '250-450만원') needScore += 5;
    
    // 가구 점수: 다자녀/한부모 우대
    if (['다자녀', '한부모', '자녀있음'].includes(answers.household)) needScore += 10;
    if (answers.household === '1인가구' || answers.household === '신혼부부') needScore += 5;

    // 데이터 준비
    const incomeMap = { '100만원미만': 50, '100-250만원': 200, '250-450만원': 350, '450만원이상': 700 };
    const incomeNum = incomeMap[answers.income] || 300;
    const householdMap = { '1인가구': 1, '신혼부부': 2, '자녀있음': 3, '다자녀': 4, '한부모': 2, '기타': 2 };
    const familyCount = householdMap[answers.household] || 1;
    const data = { ...answers, incomeNum, familyCount };

    // 3. 혜택 매칭 및 가산점
    let potentialScore = 0;
    welfareData.forEach(item => {
        // 카테고리 필터링 (V11 Smart Filter)
        let isCategoryMatch = true;
        if (answers.category && answers.category !== '전체') {
             if (item.category !== answers.category) isCategoryMatch = false;
        }

        if (item.condition(data) && isCategoryMatch) {
            matched.push(item);
            totalAmount += (item.monthlyAmount || 0);
            
            // 매칭 아이템당 가산점 (최대 40점 제한)
            if (potentialScore < 40) {
                potentialScore += 3; 
            }
        }
    });

    // 4. 최종 점수 계산 및 테마 적용
    let finalScore = baseScore + needScore + potentialScore;
    
    // 감점 요인 (고소득 + 생활비 지원 요청 시)
    if (answers.income === '450만원이상' && answers.category === '생활비') finalScore -= 10;

    // 만점 방지 및 보정
    finalScore = Math.min(Math.max(finalScore, 45), 99); // 최소 45, 최대 99

    // 지역별 정렬 로직 (기존 유지)
    matched.sort((a, b) => {
        let scoreA = a.relevance;
        let scoreB = b.relevance;
        const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
        if (regionBtn) {
            const regionName = regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim();
            if (answers.region === 'jeonbuk' && (a.tag.includes('전북') || a.tag.includes('전주'))) scoreA += 1000;
            if (answers.region === 'jeonbuk' && (b.tag.includes('전북') || b.tag.includes('전주'))) scoreB += 1000;
            if (a.tag.includes(regionName)) scoreA += 800;
            if (b.tag.includes(regionName)) scoreB += 800;
        }
        return scoreB - scoreA;
    });

    if (matched.length === 0) {
        matched = [{ name: '상세 분석 필요', description: '대표님의 상황에 맞는 숨은 혜택을 로거 블로그에서 확인해보세요!', icon: '🔍', tag: '맞춤안내', applyUrl: 'https://10000nanzip.tistory.com/' }];
    }

    // 결과 페이지 테마 적용
    applyScoreTheme(finalScore);

    return { score: finalScore, benefits: matched, totalAmount };
}

// 점수별 테마 적용 함수
function applyScoreTheme(score) {
    const resContainer = document.querySelector('.result-container');
    
    // 기존 테마 클래스 제거
    if (resContainer) {
        resContainer.classList.remove('score-tier-basic', 'score-tier-bronze', 'score-tier-silver', 'score-tier-gold');
        
        if (score >= 90) {
            resContainer.classList.add('score-tier-gold');
            shootConfetti();
        } else if (score >= 71) {
            resContainer.classList.add('score-tier-silver');
        } else if (score >= 51) {
            resContainer.classList.add('score-tier-bronze');
        } else {
            resContainer.classList.add('score-tier-basic');
        }
    }
}

// 꽃가루 효과 함수
function shootConfetti() {
    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#fcd34d'];
    for(let i=0; i<50; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px'; // Start from top
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(conf);
        
        // Remove after animation
        setTimeout(() => conf.remove(), 5000);
    }
}

// 전역 변수로 검색 결과 저장
let currentBenefits = { custom: [], local: [], agency: [] };

// 탭 변경
function changeTab(category, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderBenefits(category);
}

// 결과 표시
function showResult() {
    const { score, benefits, totalAmount } = calcResult();
    document.getElementById('step-loading').classList.remove('active');
    document.getElementById('step-result').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    history.pushState({ step: 'result' }, '', '#result');

    // 점수 애니메이션
    animateNumber('resultScore', score, 1500);

    // 메시지 업데이트
    let title = '대표님은 전국 상위 1% 복지 스마트!';
    if (score < 40) title = '복지 혜택, 더 많이 챙기실 수 있어요!';
    else if (score < 70) title = '기초를 탄탄하게 챙기고 계시네요!';
    else if (score < 90) title = '대단해요! 복지 고수의 기운이 느껴져요!';

    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultCountText').textContent = `숨은 혜택이 ${benefits.length}건 발견되었습니다!`;

    // 혜택 분류
    currentBenefits = { custom: [], local: [], agency: [] };

    const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
    const regionName = regionBtn ? regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim() : '내 지역';
    const subRegionBtn = document.querySelector(`.opt-btn.selected[onclick*="subRegion"]`);
    const subRegionName = subRegionBtn ? subRegionBtn.innerText : '';

    benefits.forEach(b => {
        if (['초록우산', '굿네이버스', '이랜드복지재단', '희망친구기아대책'].includes(b.tag)) {
            currentBenefits.agency.push(b);
        } else if (b.tag.includes(regionName) || b.tag === '지자체공통' || (subRegionName && b.tag.includes(subRegionName))) {
            currentBenefits.local.push(b);
        } else {
            currentBenefits.custom.push(b);
        }
    });

    // 기본 탭(맞춤 혜택) 렌더링
    renderBenefits('custom');
}

// 혜택 리스트 렌더링
function renderBenefits(category) {
    const list = document.getElementById('benefitList');
    list.innerHTML = '';

    const items = currentBenefits[category];
    if (!items || items.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:40px; color:#64748b;">관련된 혜택이 아직 없습니다.</p>';
        return;
    }

    items.forEach(b => {
        const card = document.createElement('div');
        card.className = 'benefit-card animate-fade';

        // 금액 표시 포맷
        const amountText = b.monthlyAmount ? `최대 ${Math.round(b.monthlyAmount).toLocaleString()}원` : '혜택 확인 필요';

        card.innerHTML = `
            <div class="agency-badge">🏛️ ${b.tag}</div>
            <div class="benefit-title">${b.name}</div>
            <div class="benefit-desc">${b.desc || b.description}</div>
            <div class="benefit-meta">
                <div class="benefit-amount">💰 ${amountText}</div>
                <a href="${b.applyUrl || '#'}" class="benefit-link-btn" target="_blank">신청하기 ➔</a>
            </div>
        `;
        list.appendChild(card);
    });
}

// 숫자 애니메이션 함수
function animateNumber(id, target, duration, isLocale = false) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const startTime = performance.now();
    function step(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = isLocale ? value.toLocaleString() : value;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// 꽃가루 효과 (V3 통합 버전)
function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#1a56db', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 6.28
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speed;
            p.angle += 0.1;
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (pieces.every(p => p.y > canvas.height)) {
            canvas.remove();
        } else {
            requestAnimationFrame(draw);
        }
    }
    draw();
}

// 복사 및 공유
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => showToast('🔗 링크가 복사되었습니다!'));
}

function shareKakao() {
    showToast('💬 카카오톡 공유 기능이 준비 중입니다. 링크 복사를 이용해주세요!');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// AI 챗봇
// AI 챗봇 (V12 Scenario)
const chatScenario = {
    intro: "안녕하세요! 로거 AI입니다. 🤖<br>대표님의 복지 점수를 분석해드렸는데, 어떤 점이 궁금하신가요?",
    options: [
        { text: "💰 못 찾은 돈 더 찾아줘", answer: "현재 입력하신 정보로는 최적의 혜택을 모두 찾아드렸어요! 다만, 가족 구성원 정보를 수정하면 추가 혜택이 나올 수도 있습니다. 다시 진단해보시겠어요?" },
        { text: "📝 신청은 어떻게 해?", answer: "각 혜택 카드의 '지금 바로 신청하기' 버튼을 누르시면 해당 기관의 공식 신청 페이지로 바로 연결해드립니다. 복잡한 서류는 제가 블로그에 정리해둘게요!" },
        { text: "📊 내 점수가 평균이야?", answer: "대표님의 점수는 상위 그룹에 속합니다! 보통 처음 조회하시는 분들은 40~50점이 나오는데, 아주 훌륭한 복지 지능을 가지고 계시네요 👍" }
    ]
};

document.getElementById('btn-ai-chat').onclick = () => {
    const chatBox = document.getElementById('aiChatBox');
    if (chatBox.style.display === 'block') {
        chatBox.style.display = 'none';
    } else {
        chatBox.style.display = 'block';
        initChat();
    }
};

function initChat() {
    const content = document.getElementById('chatContent');
    if (content.childElementCount > 0) return; // 이미 초기화됨

    addMessage('bot', chatScenario.intro);
    renderOptions();
}

function addMessage(sender, text) {
    const content = document.getElementById('chatContent');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = text;
    content.appendChild(msgDiv);
    content.scrollTop = content.scrollHeight;
}

function renderOptions() {
    const content = document.getElementById('chatContent');
    const optDiv = document.createElement('div');
    optDiv.className = 'chat-options';

    chatScenario.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chat-opt-btn';
        btn.textContent = opt.text;
        btn.onclick = () => {
            addMessage('user', opt.text);
            setTimeout(() => addMessage('bot', opt.answer), 600);
        };
        optDiv.appendChild(btn);
    });
    content.appendChild(optDiv);
    content.scrollTop = content.scrollHeight;
}

// PDF 다운로드
function downloadPdf() {
    const element = document.getElementById('app-content');
    const opt = {
        margin: 10,
        filename: 'my_welfare_report_v10.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
}

// 다시 시작 (페이지 새로고침 없는 테마)
function restart() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    Object.keys(answers).forEach(key => delete answers[key]);

    document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.btn-next').forEach(b => b.disabled = true);

    document.querySelector('.step.active').classList.remove('active');
    document.getElementById('step-1').classList.add('active');
    updateProgress(0);

    // 히스토리 초기화
    history.replaceState({ step: 1 }, '', '#step-1');
}

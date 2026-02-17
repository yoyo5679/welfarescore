const answers = {};
const TOTAL_STEPS = 5;

// 소득 기준 데이터 (2026년 예정치 기준)
const MEDIAN_INCOME_2026 = { 1: 2564238, 2: 4199292, 3: 5359036, 4: 6494738, 5: 7556719, 6: 8555952 };

// 범정부·유관기관 통합 복지 데이터베이스 (V4)
const welfareData = [
    // ── [법정/중앙정부] 복지로 기반 ──
    {
        name: '기초생활수급 (생계급여)',
        description: '소득 인정액이 중위소득 32% 이하인 경우 생활비를 지원합니다.',
        icon: '🍚', tag: '보건복지부', applyUrl: 'https://www.bokjiro.go.kr',
        condition: (d) => {
            const median = MEDIAN_INCOME_2026[Math.min(d.familyCount || 1, 6)];
            return d.incomeNum <= (median * 0.32 / 10000);
        }, relevance: 50, monthlyAmount: 713102
    },
    {
        name: '기초생활수급 (주거급여)',
        description: '임차료 지원 또는 주택 수리 지원 (중위소득 48% 이하)',
        icon: '🏠', tag: '국토교통부', applyUrl: 'https://www.bokjiro.go.kr',
        condition: (d) => {
            const median = MEDIAN_INCOME_2026[Math.min(d.familyCount || 1, 6)];
            return d.incomeNum <= (median * 0.48 / 10000);
        }, relevance: 40, monthlyAmount: 341000
    },
    {
        name: '2026 부모급여',
        description: '0세 월 150만원, 1세 월 100만원 지원',
        icon: '🍼', tag: '보건복지부', applyUrl: 'https://www.bokjiro.go.kr',
        condition: (d) => d.category === '육아' || d.household === '자녀있음',
        relevance: 50, monthlyAmount: 1250000
    },
    {
        name: '근로장려금',
        description: '저소득 근로자에게 최대 330만원 지급',
        icon: '💰', tag: '국세청', applyUrl: 'https://www.hometax.go.kr',
        condition: (d) => d.incomeNum <= 300,
        relevance: 30, monthlyAmount: 275000
    },

    // ── [모빌리티/교통] K-패스 ──
    {
        name: 'K-패스 (교통비 환급)',
        description: '대중교통 이용료 20~53% 무제한 환급 (전국 공통)',
        icon: '🚌', tag: '국토교통부', applyUrl: 'https://korea-pass.kr',
        condition: (d) => true, // 전국민 대상
        relevance: 15, monthlyAmount: 30000
    },

    // ── [서울청년몽땅정보통] 서울시 특화 ──
    {
        name: '서울청년수당',
        description: '서울 거주 미취업 청년 구직활동 지원금 (월 50만원)',
        icon: '🏙️', tag: '서울특별시', applyUrl: 'https://youth.seoul.go.kr',
        condition: (d) => d.region === 'seoul' && d.age === '20대' && (d.category === '취업' || d.incomeNum <= 250),
        relevance: 45, monthlyAmount: 500000
    },
    {
        name: '서울시 청년월세지원',
        description: '서울 거주 청년 대상 월 20만원 주거비 지원',
        icon: '🏘️', tag: '서울특별시', applyUrl: 'https://youth.seoul.go.kr',
        condition: (d) => d.region === 'seoul' && d.age === '20대' && d.category === '주거',
        relevance: 40, monthlyAmount: 200000
    },
    {
        name: '서울 영테크 (재무상담)',
        description: '청년 대상 1:1 맞춤형 재무 진단 및 금융 교육',
        icon: '📈', tag: '서울특별시', applyUrl: 'https://youth.seoul.go.kr',
        condition: (d) => d.region === 'seoul' && d.age === '20대',
        relevance: 20, monthlyAmount: 0 // 서비스형 혜택
    },

    // ── [중소벤처기업부] 소상공인/창업 ──
    {
        name: '소상공인 경영안정 바우처',
        description: '전기·가스료 등 고정비 부담 경감 (최대 25만원)',
        icon: '⚡', tag: '중소벤처기업부', applyUrl: 'https://www.sbiz24.kr',
        condition: (d) => d.category === '취업' && d.incomeNum <= 250, // 자영업자/창업 관심층 대상
        relevance: 35, monthlyAmount: 250000 / 12 // 연간 환산
    },
    {
        name: '청년 로컬 창업 지원 사업',
        description: '지역 기반 혁신 아이디어 창업가 육성 및 자금 지원',
        icon: '🚀', tag: '중소벤처기업부', applyUrl: 'https://www.k-startup.go.kr',
        condition: (d) => d.category === '취업' && d.age === '20대',
        relevance: 40, monthlyAmount: 0 // 교육/멘토링/사업비 지원
    },
    {
        name: '희망리턴패키지 (재기 지원)',
        description: '폐업 소상공인 취업/재창업 및 점포 철거비 지원',
        icon: '🔄', tag: '중소벤처기업부', applyUrl: 'https://www.sbiz24.kr',
        condition: (d) => d.category === '생활비' && d.incomeNum <= 150,
        relevance: 30, monthlyAmount: 0
    },

    // ── [경기도] 잡아바 어플라이 ──
    {
        name: '경기도 청년 복지포인트',
        description: '중소기업 재직 청년 대상 연 120만원 복지포인트',
        icon: '🌲', tag: '경기도', applyUrl: 'https://youth.jobaba.net',
        condition: (d) => d.region === 'gyeonggi' && d.age === '20대' && d.category === '취업',
        relevance: 40, monthlyAmount: 100000
    },
    {
        name: '경기도 청년면접수당',
        description: '구직 청년 대상 면접 1회당 5만원 지급 (연 최대 50만원)',
        icon: '💼', tag: '경기도', applyUrl: 'https://apply.jobaba.net',
        condition: (d) => d.region === 'gyeonggi' && d.age === '20대' && d.category === '취업',
        relevance: 30, monthlyAmount: 50000 // 회당 기준
    },

    // ── [전국 사회복지관] 커뮤니티 케어 ──
    {
        name: '전국 사회복지관 긴급 지원',
        description: '위기 가구 대상 긴급 생계·의료·주거 지원 및 급식 서비스',
        icon: '🆘', tag: '전국사회복지관', applyUrl: 'https://www.kaswc.or.kr',
        condition: (d) => d.incomeNum <= 120 || d.category === '의료',
        relevance: 45, monthlyAmount: 0 // 서비스 제공 중심
    },
    {
        name: '복지관 교육문화 프로그램',
        description: '취약 계층 및 어르신 대상 학습 지도 및 여가 문화 강좌',
        icon: '📚', tag: '전국사회복지관', applyUrl: 'https://www.kaswc.or.kr',
        condition: (d) => d.age === '60대이상' || d.category === '교육',
        relevance: 25, monthlyAmount: 0
    },

    // ── [전북특별자치도] 하이퍼 로컬 특화 (V6) ──
    {
        name: '전북형 청년 활력 수당',
        description: '미취업 청년 구직활동 수당 지원 (월 50만원, 6개월)',
        icon: '💸', tag: '전북특별자치도', applyUrl: 'https://jbyouth.ezwel.com',
        condition: (d) => d.region === 'jeonbuk' && d.age === '20대' && d.category === '취업',
        relevance: 100, monthlyAmount: 500000
    },
    {
        name: '전북청년 함께 두배 적금',
        description: '본인 저축액만큼 도에서 추가 매칭 지원 (자산 형성)',
        icon: '💰', tag: '전북특별자치도', applyUrl: 'https://www.jb.go.kr',
        condition: (d) => d.region === 'jeonbuk' && (d.age === '20대' || d.age === '30대'),
        relevance: 90, monthlyAmount: 100000
    },
    {
        name: '전주 청년 만원주택 (청춘☆별채)',
        description: '전주시 거주 청년 대상 파격 주거 임대 지원',
        icon: '🏠', tag: '전주시', applyUrl: 'https://youth.jeonju.go.kr',
        condition: (d) => d.region === 'jeonbuk' && d.category === '주거',
        relevance: 95, monthlyAmount: 150000
    },
    {
        name: '전북 소상공인 회생 보듬자금',
        description: '소상공인 1%대 저금리 특례보증 및 이차보전 지원',
        icon: '🏢', tag: '전북신용보증재단', applyUrl: 'https://www.jbba.kr',
        condition: (d) => d.region === 'jeonbuk' && d.category === '취업' && d.incomeNum <= 300,
        relevance: 85, monthlyAmount: 50000
    },
    {
        name: '전북형 긴급복지지원',
        description: '위기상황 발생 가구 대상 생계·의료·주거 지원 (기준 완화)',
        icon: '🛡️', tag: '전북특별자치도', applyUrl: 'https://www.bokjiro.go.kr',
        condition: (d) => d.region === 'jeonbuk' && d.incomeNum <= 150,
        relevance: 80, monthlyAmount: 0
    },
    {
        name: '전북인복지 (로컬 허브)',
        description: '내 주변 지역 사회복지관 프로그램 및 시설 정보 통합 제공',
        icon: '🔗', tag: '전북인복지플랫폼', applyUrl: 'https://jbwelfare.or.kr',
        condition: (d) => d.region === 'jeonbuk',
        relevance: 70, monthlyAmount: 0
    },

    // ── [부산광역시] 부산형 복지 (V7) ──
    {
        name: '부산 청년 기쁨두배 통장',
        description: '저축액만큼 시에서 매칭 지원 (최대 1,080만원 자산 형성)',
        icon: '💰', tag: '부산광역시', applyUrl: 'https://www.busanyouth.kr',
        condition: (d) => d.region === 'busan' && d.age === '20대' && d.incomeNum <= 250,
        relevance: 100, monthlyAmount: 150000
    },
    {
        name: '부산 청년 월세 지원',
        description: '부산 거주 무주택 청년 대상 월 20만원 주거비 지원',
        icon: '🏠', tag: '부산광역시', applyUrl: 'https://www.busanyouth.kr',
        condition: (d) => d.region === 'busan' && d.age === '20대' && d.category === '주거',
        relevance: 90, monthlyAmount: 200000
    },

    // ── [인천광역시] 인천 드림 (V7) ──
    {
        name: '인천 재직청년 복지포인트',
        description: '인천 중소기업 재직 청년 대상 연 120만원 복지비 지원',
        icon: '💳', tag: '인천광역시', applyUrl: 'https://youth.incheon.go.kr',
        condition: (d) => d.region === 'incheon' && d.age === '20대' && d.category === '취업',
        relevance: 95, monthlyAmount: 100000
    },

    // ── [대구광역시] 대구 희망 (V7) ──
    {
        name: '대구 사회진입활동지원금',
        description: '취업 준비 청년 대상 총 150만원 활동비 지급',
        icon: '🚀', tag: '대구광역시', applyUrl: 'https://youthdream.daegu.go.kr',
        condition: (d) => d.region === 'daegu' && d.age === '20대' && d.category === '취업',
        relevance: 100, monthlyAmount: 500000
    },

    // ── [울산광역시] 울산 복지 (V7) ──
    {
        name: '울산 청년 구직 활동 지원금',
        description: '울산 거주 미취업 청년 대상 월 50만원 (최대 6개월)',
        icon: '💸', tag: '울산광역시', applyUrl: 'https://www.ulsan.go.kr/youth',
        condition: (d) => d.region === 'ulsan' && d.age === '20대' && d.category === '취업',
        relevance: 100, monthlyAmount: 500000
    },

    // ── [세종특별자치시] 세종 키움 (V7) ──
    {
        name: '세종 청년 주거임대료 지원',
        description: '세종시 거주 무주택 청년 월 최대 20만원 지원',
        icon: '🏘️', tag: '세종특별자치시', applyUrl: 'https://www.sejong.go.kr',
        condition: (d) => d.region === 'sejong' && d.category === '주거',
        relevance: 90, monthlyAmount: 200000
    },

    // ── [강원특별자치도] 강원 육아 (V7) ──
    {
        name: '강원특별자치도 육아기본수당',
        description: '강원도 거주 아동 대상 부모급여와 별도 추가 지원',
        icon: '👶', tag: '강원특별자치도', applyUrl: 'https://www.provin.gangwon.kr',
        condition: (d) => d.region === 'gangwon' && (d.category === '육아' || d.household === '자녀있음'),
        relevance: 100, monthlyAmount: 200000
    },

    // ── [충청도] 충청 나눔 (V7) ──
    {
        name: '충북형 의료·요양 통합돌봄',
        description: '질병/장애 어르신 대상 거주지 방문 의료·돌봄 서비스',
        icon: '🏥', tag: '충청북도', applyUrl: 'https://www.cb21.net',
        condition: (d) => d.region === 'chungbuk' && (d.age === '60대이상' || d.category === '의료'),
        relevance: 95, monthlyAmount: 0
    },
    {
        name: '충남 꿈비채 (더 행복한 주택)',
        description: '충남 유자녀 가구 대상 임대료 파격 감면 지원',
        icon: '🏡', tag: '충청남도', applyUrl: 'https://www.chungnam.go.kr',
        condition: (d) => d.region === 'chungnam' && d.household === '자녀있음',
        relevance: 95, monthlyAmount: 150000
    },

    // ── [경상도] 영남 공감 (V7) ──
    {
        name: '경남형 그냥드림 (먹거리 지원)',
        description: '위기 가구 대상 긴급 먹거리 팩 및 기본 생필품 지원',
        icon: '🍎', tag: '경상남도', applyUrl: 'https://www.gyeongnam.go.kr',
        condition: (d) => d.region === 'gyeongnam' && d.incomeNum <= 150,
        relevance: 85, monthlyAmount: 0
    },
    {
        name: '경북 다자녀 주택 취득세 지원',
        description: '경북 거주 다자녀 가구 주택 구입 시 세제 혜택',
        icon: '📜', tag: '경상북도', applyUrl: 'https://www.gb.go.kr',
        condition: (d) => d.region === 'gyeongbuk' && d.household === '다자녀',
        relevance: 80, monthlyAmount: 0
    },

    // ── [전라남도] 전남 행복 (V7) ──
    {
        name: '전남 출생기본소득',
        description: '전남 거주 모든 출생아 대상 월 10만원 (최대 18년)',
        icon: '🎁', tag: '전라남도', applyUrl: 'https://www.jeonnam.go.kr',
        condition: (d) => d.region === 'jeonnam' && (d.category === '육아' || d.household === '자녀있음'),
        relevance: 100, monthlyAmount: 100000
    },

    // ── [제주특별자치도] 제주 가치 (V7) ──
    {
        name: '제주 손주돌봄수당',
        description: '맞벌이 가정의 조부모가 손자녀 돌봄 시 월 수당 지급',
        icon: '👵', tag: '제주특별자치도', applyUrl: 'https://www.jeju.go.kr',
        condition: (d) => d.region === 'jeju' && d.household === '자녀있음',
        relevance: 100, monthlyAmount: 300000
    }
];

// 옵션 선택
function selectOption(el, key) {
    const parent = el.closest('.options');
    parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    answers[key] = el.dataset.val;

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
}

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

    const loadingIds = ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'];
    loadingIds.forEach((id, i) => {
        setTimeout(() => {
            document.getElementById(id).classList.add('show');
            if (i === 4) setTimeout(showResult, 800);
        }, 500 + i * 600);
    });
}

// 결과 데이터 계산
function calcResult() {
    let score = 55;
    let matched = [];
    let totalAmount = 0;

    // 소득 점수화
    const incomeMap = { '100만원미만': 50, '100-250만원': 200, '250-450만원': 350, '450만원이상': 700 };
    const incomeNum = incomeMap[answers.income] || 300;
    const householdMap = { '1인가구': 1, '신혼부부': 2, '자녀있음': 3, '다자녀': 4, '한부모': 2, '기타': 2 };
    const familyCount = householdMap[answers.household] || 1;

    const data = { ...answers, incomeNum, familyCount };

    welfareData.forEach(item => {
        if (item.condition(data)) {
            score += item.relevance;
            matched.push(item);
            totalAmount += (item.monthlyAmount || 0);
        }
    });

    // 지역별 맞춤 정렬 (V7 가변형)
    matched.sort((a, b) => {
        let scoreA = a.relevance;
        let scoreB = b.relevance;

        const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
        if (regionBtn) {
            // 이모지 제외 순수 지역명 추출 (예: '🌊부산' -> '부산')
            const regionName = regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim();

            // 전북/전주 특화 (대표님 요청 가중치 우선 유지)
            if (answers.region === 'jeonbuk' && (a.tag.includes('전북') || a.tag.includes('전주'))) scoreA += 1000;
            if (answers.region === 'jeonbuk' && (b.tag.includes('전북') || b.tag.includes('전주'))) scoreB += 1000;

            // 전국 모든 지역 지자체 가중치 적용
            if (a.tag.includes(regionName)) scoreA += 800;
            if (b.tag.includes(regionName)) scoreB += 800;
        }

        return scoreB - scoreA;
    });

    score = Math.min(score, 99);
    if (matched.length === 0) {
        matched = [{ name: '상세 분석 필요', description: '대표님의 상황에 맞는 숨은 혜택을 로거 블로그에서 확인해보세요!', icon: '🔍', tag: '맞춤안내', applyUrl: 'https://10000nanzip.tistory.com/' }];
    }

    return { score, benefits: matched, totalAmount };
}

// 결과 표시
function showResult() {
    const { score, benefits, totalAmount } = calcResult();
    document.getElementById('step-loading').classList.remove('active');
    document.getElementById('step-result').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 점수 애니메이션
    animateNumber('resultScore', score, 1500);
    // 수령액 애니메이션
    animateNumber('total-amount-display', totalAmount, 2000, true);

    // 등급 및 랭크
    let grade, rank;
    if (score >= 90) { grade = '👑 복지 마스터'; rank = '전국 상위 1%'; triggerConfetti(); }
    else if (score >= 75) { grade = '🥈 복지 고수'; rank = '전국 상위 12%'; }
    else if (score >= 60) { grade = '🥉 복지 중수'; rank = '전국 상위 30%'; }
    else { grade = '🌱 복지 새싹'; rank = '전국 상위 55%'; }

    document.getElementById('resultGrade').textContent = grade;
    document.getElementById('resultRank').textContent = rank;
    document.getElementById('benefitCount').textContent = benefits.length;

    // 혜택 리스트 렌더링
    const list = document.getElementById('benefitList');
    list.innerHTML = '';
    benefits.forEach((b, i) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'benefit-card animate-fade';

            // 하이퍼 로컬 뱃지 로직 (V7 가변형)
            const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
            const regionName = regionBtn ? regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim() : '';
            const isLocal = b.tag.includes('전북') || b.tag.includes('전주') || (regionName && b.tag.includes(regionName));
            const localBadgeHtml = isLocal ? `<div class="local-badge highlight">✨ ${regionName || '내 지역'} 맞춤</div>` : '';

            card.innerHTML = `
                <div class="benefit-icon">${b.icon}</div>
                <div class="benefit-info">
                    ${localBadgeHtml}
                    <div class="benefit-name">${b.name} <span class="benefit-tag-label" style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; vertical-align: middle; margin-left: 4px; color: #475569;">${b.tag}</span></div>
                    <div class="benefit-desc">${b.desc || b.description}</div>
                    ${b.monthlyAmount ? `<span class="benefit-amount">💰 월 약 ${b.monthlyAmount.toLocaleString()}원</span>` : '<span class="benefit-amount" style="background:#f1f5f9; color:#64748b;">✨ 서비스/현물 지원</span>'}
                    <a class="benefit-link" href="${b.applyUrl || 'https://10000nanzip.tistory.com/'}" target="_blank">상세 방법 보기 →</a>
                </div>
            `;
            list.appendChild(card);
        }, i * 200);
    });
}

// 숫자 애니메이션 함수
function animateNumber(id, target, duration, isLocale = false) {
    const el = document.getElementById(id);
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
document.getElementById('btn-ai-chat').onclick = () => {
    showToast('🤖 로거 AI: "반가워요 대표님! 중기부와 지자체 지원금까지 꼼꼼히 체크해드렸어요!"');
};

// PDF 다운로드
function downloadPdf() {
    const element = document.getElementById('app-content');
    const opt = {
        margin: 10,
        filename: 'my_welfare_report_v7.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
}

// 다시 시작
function restart() {
    location.reload();
}

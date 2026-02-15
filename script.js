document.addEventListener('DOMContentLoaded', () => {
    const selectionPhase = document.getElementById('selection-phase');
    const inputPhase = document.getElementById('input-phase');
    const resultPhase = document.getElementById('result-phase');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const btnCalculate = document.getElementById('btn-calculate');
    const btnRestart = document.getElementById('btn-restart');
    const btnBackToSelect = document.getElementById('btn-back-to-select');
    const loggerMessage = document.getElementById('logger-message');
    const scoreText = document.getElementById('score-text');
    const scoreMessage = document.getElementById('score-message');
    const benefitCount = document.getElementById('benefit-count');
    const benefitList = document.getElementById('benefit-list');
    const rankBadge = document.getElementById('rank-badge');
    const btnSeniorMode = document.getElementById('btn-senior-mode');
    const btnShare = document.getElementById('btn-share');
    const rankPerText = document.getElementById('rank-per-text');
    const scoreCard = document.getElementById('score-card');

    let currentCategory = '';

    // Senior Mode Toggle
    btnSeniorMode.addEventListener('click', () => {
        document.body.classList.toggle('senior-mode');
        btnSeniorMode.classList.toggle('active');
        const isActive = document.body.classList.contains('senior-mode');
        btnSeniorMode.textContent = isActive ? '✅ 큰 글씨 적용됨' : '👓 큰 글씨 모드';
    });

    const loggerQuotes = {
        intro: "대표님, 반갑습니다! 제가 숨은 정보를 꼼꼼히 찾아드릴게요. 😊",
        senior: "어르신께 꼭 필요한 기초연금과 실버 혜택을 꼼꼼히 분석해 드릴게요. 건강하고 행복한 노후를 응원합니다! 👵👴",
        youth: "청년들의 새로운 시작을 응원하는 장학금과 주거 지원금을 모두 찾아낼게요. 대표님의 빛나는 꿈을 제가 돕겠습니다! 🧑‍🎓🚀",
        pregnancy: "예비 엄마, 아빠를 위한 정부의 소중한 지원금들을 빠짐없이 체크해 드릴게요. 예쁜 아기와의 만남을 축복합니다! ✨👶",
        infant: "아이를 키우는 부모님의 마음으로 부모급여와 아동수당을 꼼꼼히 챙겨 드릴게요. 우리 아이, 국가가 함께 키웁니다! ❤️🍼",
        middle: "성실히 달려오신 중장년 대표님을 위해 취업 및 재취업 인센티브를 분석해 드릴게요. 새로운 도전을 응원합니다! 👔✨",
        disabled: "불편함 없이 혜택을 누리실 수 있도록 장애인 전용 연금과 일자리 혜택을 정밀하게 진단해 드릴게요. ♿🤝",
        lowincome: "더 든든한 내일을 위해 정부 지원 생활 보장 혜택들을 샅샅이 찾아 드릴게요. 함께하면 더 따뜻합니다. 🏠💖",
        others: "보훈 및 다문화 등 특별한 상황에 계신 대표님을 위한 맞춤형 혜택을 찾아 드릴게요. 국가가 늘 곁에 있습니다. 🎖️🌏",
        calc: "자, 이제 정부 예산안을 샅샅이 뒤져서 대표님께 딱 맞는 혜택만 골라낼게요! 잠시만요... 🔍🚀"
    };

    document.querySelectorAll('.select-card').forEach(card => {
        card.addEventListener('click', () => {
            currentCategory = card.dataset.category;
            showInputPhase();
        });
    });

    btnBackToSelect.addEventListener('click', () => {
        history.pushState({ phase: 'selection' }, '');
        resetToSelection();
    });

    function resetToSelection() {
        selectionPhase.classList.remove('hidden');
        inputPhase.classList.add('hidden');
        resultPhase.classList.add('hidden');
        window.scrollTo(0, 0);
    }

    function showInputPhase(pushHistory = true) {
        selectionPhase.classList.add('hidden');
        inputPhase.classList.remove('hidden');
        resultPhase.classList.add('hidden');
        if (pushHistory) history.pushState({ phase: 'input', category: currentCategory }, '');
        renderDynamicInputs();
        loggerMessage.textContent = loggerQuotes[currentCategory] || loggerQuotes.intro;
        window.scrollTo(0, 0);
    }

    function renderDynamicInputs() {
        let html = '';
        const commonInputs = `
            <div class="form-group animate-fade">
                <label>거주 지역</label>
                <select id="region">
                    <option value="seoul">서울특별시</option>
                    <option value="gyeonggi">경기도</option>
                    <option value="other">기타 지역</option>
                </select>
            </div>
            <div class="form-group animate-fade">
                <label>가구원 수 (명)</label>
                <input type="number" id="family-count" value="1" min="1">
            </div>
        `;

        if (currentCategory === 'senior') {
            html = `
                <div class="form-group animate-fade">
                    <label>대표님의 출생 연도 (만 65세 이상 권장)</label>
                    <input type="number" id="birth-year" value="1960" min="1900" max="2026">
                </div>
                <div class="form-group animate-fade">
                    <label>월 소득 수준 (만원)</label>
                    <input type="number" id="income" placeholder="예: 200">
                </div>
            `;
        } else if (currentCategory === 'youth') {
            html = `
                <div class="form-group animate-fade">
                    <label>대표님의 출생 연도 (만 19~34세)</label>
                    <input type="number" id="birth-year" value="2000" min="1900" max="2026">
                </div>
                <div class="form-group animate-fade">
                    <label>자립준비청년 여부</label>
                    <select id="is-self-reliant">
                        <option value="no">해당 없음</option>
                        <option value="yes">해당함 (보호종료 5년 이내)</option>
                    </select>
                </div>
                <div class="form-group animate-fade">
                    <label>현재 상황 (직업/학업)</label>
                    <select id="job-status-youth">
                        <option value="student">대학생·대학원생</option>
                        <option value="worker">직장인·사회초년생</option>
                        <option value="none">무직·취업준비생</option>
                    </select>
                </div>
                <div class="form-group animate-fade">
                    <label>월 소득 (만원)</label>
                    <input type="number" id="income" placeholder="예: 250">
                </div>
            `;
        } else if (currentCategory === 'pregnancy') {
            html = `
                <div class="form-group animate-fade">
                    <label>혼인 및 출산 상황</label>
                    <select id="marriage-status">
                        <option value="married">신혼부부 (7년 이내)</option>
                        <option value="married-over">기혼 부부 (7년 초과)</option>
                        <option value="expecting">임신 중 / 출산 예정</option>
                        <option value="none">해당 없음</option>
                    </select>
                </div>
                <div class="form-group animate-fade">
                    <label>가구 월 소득 (만원)</label>
                    <input type="number" id="income" placeholder="예: 600">
                </div>
            `;
        } else if (currentCategory === 'infant') {
            html = `
                <div class="form-group animate-fade">
                    <label>아이의 출생 연도 (만 0~8세 대상)</label>
                    <input type="number" id="birth-year-child" value="2024" min="2010" max="2026">
                </div>
                <div class="form-group animate-fade">
                    <label>아이의 현재 개월 수 (아동수당/부모급여용)</label>
                    <input type="number" id="child-age-months" value="0" min="0" max="100">
                </div>
                <div class="form-group animate-fade">
                    <label>가구 월 소득 (만원)</label>
                    <input type="number" id="income" placeholder="예: 400">
                </div>
            `;
        } else if (currentCategory === 'disabled') {
            html = `
                <div class="form-group animate-fade">
                    <label>장애 정도</label>
                    <select id="disability-level">
                        <option value="severe">심한 장애</option>
                        <option value="mild">심하지 않은 장애</option>
                    </select>
                </div>
                <div class="form-group animate-fade">
                    <label>월 소득 수준 (만원)</label>
                    <input type="number" id="income" placeholder="예: 150">
                </div>
            `;
        } else if (currentCategory === 'lowincome') {
            html = `
                <div class="form-group animate-fade">
                    <label>가구 상황</label>
                    <select id="household-type">
                        <option value="basic">기초생활수급자</option>
                        <option value="single-parent">한부모 가족</option>
                        <option value="next-tier">차상위 계층</option>
                        <option value="normal">해당 없음</option>
                    </select>
                </div>
                <div class="form-group animate-fade">
                    <label>월 소득 (만원)</label>
                    <input type="number" id="income" placeholder="예: 100">
                </div>
            `;
        } else {
            html = `
                <div class="form-group animate-fade">
                    <label>대표님의 출생 연도</label>
                    <input type="number" id="birth-year" value="1985" min="1900" max="2026">
                </div>
                <div class="form-group animate-fade">
                    <label>월 소득 (만원)</label>
                    <input type="number" id="income" placeholder="예: 400">
                </div>
            `;
        }
        dynamicInputs.innerHTML = html + commonInputs;
    }

    const MEDIAN_INCOME_2026 = { 1: 2564238, 2: 4199292, 3: 5359036, 4: 6494738, 5: 7556719, 6: 8555952 };

    const welfareData = [
        {
            name: '기초생활수급 (생계급여)',
            description: '소득 인정액이 중위소득 32% 이하인 경우 생활비를 지원합니다.',
            icon: '🍚', tag: '법정복지', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => {
                const median = MEDIAN_INCOME_2026[Math.min(data.familyCount, 6)] || MEDIAN_INCOME_2026[4];
                return data.income <= (median * 0.32 / 10000);
            }, relevance: 50
        },
        {
            name: '기초생활수급 (의료급여)',
            description: '중위소득 40% 이하 대상, 급여 항목 의료비 전액 또는 대부분 지원',
            icon: '🏥', tag: '법정복지', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => {
                const median = MEDIAN_INCOME_2026[Math.min(data.familyCount, 6)] || MEDIAN_INCOME_2026[4];
                return data.income <= (median * 0.40 / 10000);
            }, relevance: 45
        },
        {
            name: '기초생활수급 (주거급여)',
            description: '중위소득 48% 이하 대상, 임차료 지원 또는 주택 수리 지원',
            icon: '🏠', tag: '법정복지', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => {
                const median = MEDIAN_INCOME_2026[Math.min(data.familyCount, 6)] || MEDIAN_INCOME_2026[4];
                return data.income <= (median * 0.48 / 10000);
            }, relevance: 40
        },
        {
            name: '기초생활수급 (교육급여)',
            description: '중위소득 50% 이하 대상, 초중고 학생 교육 활동비 지원',
            icon: '🎓', tag: '법정복지', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => {
                const median = MEDIAN_INCOME_2026[Math.min(data.familyCount, 6)] || MEDIAN_INCOME_2026[4];
                return data.income <= (median * 0.50 / 10000);
            }, relevance: 35
        },
        {
            name: '차상위계층 확인 (희망저축계좌 등)',
            description: '중위소득 50% 이하 대상, 자산형성 지원 및 각종 감면 혜택',
            icon: '💰', tag: '차상위', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => {
                const median = MEDIAN_INCOME_2026[Math.min(data.familyCount, 6)] || MEDIAN_INCOME_2026[4];
                return data.income <= (median * 0.50 / 10000);
            }, relevance: 30
        },
        {
            name: '국가장학금 (I유형)',
            description: '소득 연계형 등록금 전액/일부 지원',
            icon: '🎓', tag: '한국장학재단', applyUrl: 'https://www.kosaf.go.kr',
            condition: (data) => (data.category === 'youth' && data.jobStatusYouth === 'student') && data.income <= 350,
            relevance: 35
        },
        {
            name: '신생아 특례 대출 (출산 가구)',
            description: '최저 1%대 저금리 주택자금 대출 (혼인 상관없이 출산/입양 가구)',
            icon: '👶', tag: '주택도시기금', applyUrl: 'https://nhuf.molit.go.kr',
            condition: (data) => (data.category === 'infant' || data.category === 'pregnancy' || data.marriageStatus === 'married-over' || data.marriageStatus === 'married') && data.income <= 20000,
            relevance: 45
        },
        {
            name: '2026 부모급여',
            description: '0세 월 150만원, 1세 월 100만원 현금 지원',
            icon: '🍼', tag: '보건복지부', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => data.category === 'infant' && data.childAgeMonths <= 23,
            relevance: 50
        },
        {
            name: '아동수당',
            description: '8세 미만 모든 아동에게 월 10만원 지원',
            icon: '🧒', tag: '보건복지부', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => data.category === 'infant' && data.childAgeMonths <= 95,
            relevance: 30
        },
        {
            name: '신혼부부 버팀목 전세자금 대출',
            description: '신혼부부 전용 저금리(1.5%~2.7%) 전세자금 대출 지원',
            icon: '🏠', tag: '주택도시기금', applyUrl: 'https://nhuf.molit.go.kr',
            condition: (data) => (data.marriageStatus === 'married' || data.marriageStatus === 'married-over' || data.category === 'pregnancy') && data.income <= 1000,
            relevance: 25
        },
        {
            name: '기초연금 (만 65세 이상)',
            description: '소득 하위 70% 어르신에게 월 최대 40만원 지원',
            icon: '👴', tag: '보건복지부', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => (data.age >= 65 || data.category === 'senior') && data.income <= 213,
            relevance: 40
        },
        {
            name: '청년 주거지원 (월세지원)',
            description: '월 최대 20만원, 24개월간 월세 지원',
            icon: '🏙️', tag: '국토교통부', applyUrl: 'https://www.bokjiro.go.kr',
            condition: (data) => data.category === 'youth' && (data.jobStatusYouth === 'student' || data.jobStatusYouth === 'none') && data.income <= 200,
            relevance: 25
        },
        {
            name: '중소기업 취업 청년 소득세 감면',
            description: '중소기업 취업 후 5년간 소득세 90% 감면',
            icon: '📑', tag: '국세청', applyUrl: 'https://www.hometax.go.kr',
            condition: (data) => data.category === 'youth' && data.jobStatusYouth === 'worker',
            relevance: 20
        },
        {
            name: '자립준비청년 자립정착금',
            description: '아동복지시설 보호종료 시 자립을 위한 일시금 지원',
            icon: '🕊️', tag: '자립정보ON', applyUrl: 'https://jaripon.ncrc.or.kr',
            condition: (data) => data.isSelfReliant === 'yes',
            relevance: 45
        }
    ];

    function calculateResults(data, pushHistory = true) {
        inputPhase.classList.add('hidden');
        resultPhase.classList.remove('hidden');
        loggerMessage.textContent = loggerQuotes.calc;
        if (pushHistory) history.pushState({ phase: 'result', data: data }, '');

        let score = 35;
        let matchedBenefits = [];

        welfareData.forEach(item => {
            if (item.condition(data)) {
                score += item.relevance;
                matchedBenefits.push(item);
            }
        });

        if (score > 100) score = 100;

        animateScore(score);
        renderBenefits(matchedBenefits.length > 0 ? matchedBenefits : [{ name: '상세 분석 필요', description: '로거 블로그에서 대표님의 상황에 맞는 숨은 혜택을 더 찾아보세요.', icon: '🔍', tag: '전용안내', applyUrl: 'https://yourblog.tistory.com' }]);
        window.scrollTo(0, 0);
    }

    function getRank(score) {
        if (score >= 90) return { label: '👑 복지 만렙', color: '#ffcc00' };
        if (score >= 60) return { label: '💡 복지 스마트', color: '#00f2ff' };
        return { label: '🌱 복지 새싹', color: '#a1a1aa' };
    }

    function animateScore(targetScore) {
        let currentScore = 0;
        const duration = 1500;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            currentScore = Math.floor(easeProgress * targetScore);
            scoreText.textContent = currentScore;
            const rank = getRank(currentScore);
            rankBadge.textContent = rank.label;
            rankBadge.style.backgroundColor = rank.color;
            if (progress < 1) requestAnimationFrame(update);
            else setScoreMessage(targetScore);
        }
        requestAnimationFrame(update);
    }

    function setScoreMessage(score) {
        if (score >= 90) {
            scoreMessage.textContent = '와우! 거의 모든 지원금을 받으실 수 있어요! 👑';
            rankPerText.textContent = `축하합니다! 상위 0.1% 복지 만렙 달성!`;
            scoreCard.classList.add('level-up');
            triggerConfetti();
        } else if (score >= 70) {
            scoreMessage.textContent = '훌륭합니다! 챙길 수 있는 혜택이 꽤 많네요. 🏆';
            rankPerText.textContent = `현재 상위 5% 수준의 복지 스마트입니다!`;
        } else {
            scoreMessage.textContent = '아직 숨은 혜택이 많아요. 로거와 함께 찾아볼까요? 🚀';
            rankPerText.textContent = `전체 사용자 중 중위권! 더 올라갈 수 있어요.`;
        }
        rankPerText.classList.remove('hidden');
    }

    function triggerConfetti() {
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#007aff', '#00f2ff', '#ffd60a', '#ff2d55', '#5856d6'];

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

    // Share result
    btnShare.addEventListener('click', () => {
        const score = scoreText.textContent;
        const rank = rankBadge.textContent;
        const text = `내 복지 점수는 [${score}점]! 👑 [${rank}] 등급 달성했습니다. 당신의 숨은 지원금도 확인해보세요! #복지점수 #정부지원금\n링크: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: '내 복지 점수 확인하기',
                text: text,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.createElement('div');
                toast.className = 'share-toast';
                toast.textContent = '결과가 클립보드에 복사되었습니다! 🎉';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            });
        }
    });

    function renderBenefits(benefits) {
        benefitCount.textContent = benefits.length;
        benefitList.innerHTML = '';
        benefits.forEach(item => {
            const card = document.createElement('div');
            card.className = 'benefit-card animate-fade';
            card.innerHTML = `
                <span class="benefit-tag">${item.tag}</span>
                <div class="benefit-header">
                    <div class="benefit-icon">${item.icon}</div>
                    <div class="benefit-info"><h3>${item.name}</h3><p>${item.description}</p></div>
                </div>
                <div class="benefit-actions">
                    <a href="${item.applyUrl}" target="_blank" class="btn-small btn-apply">지금 신청하기 🔗</a>
                    <a href="https://yourblog.tistory.com" class="btn-small btn-outline">상세 방법</a>
                </div>
            `;
            benefitList.appendChild(card);
        });
    }

    btnCalculate.addEventListener('click', () => {
        const birthYearValue = document.getElementById('birth-year')?.value || document.getElementById('birth-year-child')?.value;
        const incomeValue = document.getElementById('income')?.value;
        const familyCount = parseInt(document.getElementById('family-count')?.value || 1);
        const region = document.getElementById('region')?.value || 'seoul';
        const isSelfReliant = document.getElementById('is-self-reliant')?.value;
        const jobStatusYouth = document.getElementById('job-status-youth')?.value;
        const marriageStatus = document.getElementById('marriage-status')?.value;
        const childAgeMonths = parseInt(document.getElementById('child-age-months')?.value || 0);

        calculateResults({ category: currentCategory, age: 2026 - parseInt(birthYearValue || 1990), income: parseInt(incomeValue || 0), familyCount, region, isSelfReliant, jobStatusYouth, marriageStatus, childAgeMonths });
    });

    btnRestart.addEventListener('click', () => {
        history.pushState({ phase: 'selection' }, '');
        resetToSelection();
    });

    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (!state || state.phase === 'selection') resetToSelection();
        else if (state.phase === 'input') showInputPhase(false);
        else if (state.phase === 'result') calculateResults(state.data, false);
    });
    history.replaceState({ phase: 'selection' }, '');
});

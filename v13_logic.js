var selCat = null, QI = 0, ANS = [], QD = [];

// V13 Logic: Category Grid & Quiz Functions
function buildCatGrid() {
    console.log('Building Category Grid for age:', answers.age);
    var order = AGE_ORDER[answers.age] || ['pregnancy', 'child', 'youth', 'middle', 'senior', 'disability', 'lowincome', 'veteran'];
    // Fallback if AGE_ORDER key doesn't match
    if (!AGE_ORDER[answers.age]) {
        // Map 10대이하 -> teen, 60대이상 -> 60plus, etc.
        if (answers.age === '10대이하') order = AGE_ORDER['teen'];
        else if (answers.age === '20대') order = AGE_ORDER['20s'];
        else if (answers.age === '30대') order = AGE_ORDER['30s'];
        else if (answers.age === '40대') order = AGE_ORDER['40s'];
        else if (answers.age === '50대') order = AGE_ORDER['50s'];
        else if (answers.age === '60대이상') order = AGE_ORDER['60plus'];
    }

    var grid = document.getElementById('cat-grid');
    if (!grid) { console.error('cat-grid missing'); return; }
    grid.innerHTML = '';

    order.forEach(function (key) {
        var c = CATS[key];
        var div = document.createElement('div');
        div.className = 'catcard';
        div.innerHTML = '<span class="catem">' + c.emoji + '</span><div class="cattitle">' + c.label + '</div><div class="catsub">' + c.sub + '</div>';
        div.onclick = function () { startQuiz(key); };
        grid.appendChild(div);
    });
}

function startQuiz(cat) {
    selCat = cat;
    // Map new categories to old categories for compatibility
    var map = {
        pregnancy: '의료', child: '육아', youth: '취업', middle: '취업',
        senior: '생활비', disability: '생활비', lowincome: '생활비', veteran: '생활비'
    };
    answers.category = map[cat] || '전체';

    QD = QS[cat] || [];
    QI = 0;
    ANS = []; for (var i = 0; i < QD.length; i++) ANS.push(null);

    // Go to quiz step (Step 4 in new flow, actually ID step-4)
    nextStep(3); // from Step 3 (Category) to Step 4 (Quiz)
    drawQ();
}

function drawQ() {
    var q = QD[QI], tot = QD.length;
    var pct = Math.round(QI / tot * 100);
    document.getElementById('prog-fill').style.width = pct + '%';
    document.getElementById('prog-lbl').textContent = QI + ' / ' + tot + ' 완료';

    var nextLabel = (QI === tot - 1) ? '결과 확인하기 📊' : '다음 질문 🚀';

    var container = document.getElementById('q-container');
    container.innerHTML = '<div class="qcard"><div class="qrow"><span class="qico">' + q.ic + '</span><div class="qtitle">' + q.q + '</div></div><div class="qhint">' + q.sub + '</div><div class="qopts" id="q-opts"></div><button class="btnp" id="btn-quiz-next" onclick="nextQ()" disabled>' + nextLabel + '</button></div>';

    var el = document.getElementById('q-opts');
    q.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.className = 'qopt' + (ANS[QI] === i ? ' sel' : '');
        b.innerHTML = (q.ems && q.ems[i] ? '<span class="optem">' + q.ems[i] + '</span>' : '') + o;
        b.onclick = function () {
            ANS[QI] = i;
            document.querySelectorAll('#q-opts .qopt').forEach(opt => opt.classList.remove('sel'));
            b.classList.add('sel');
            document.getElementById('btn-quiz-next').disabled = false;
        };
        el.appendChild(b);
    });
}

function prevQ() {
    if (QI === 0) {
        prevStep(4); // Back to category
        return;
    }
    QI--;
    drawQ();
}

function nextQ() {
    if (ANS[QI] === null) return;

    // Auto-map answers to existing profile if possible (simple heuristic)
    // Map income/household based on keywords in selected option
    var selectedText = QD[QI].opts[ANS[QI]];
    if (QD[QI].q.includes('소득')) {
        if (selectedText.includes('50% 이하') || selectedText.includes('소득 없음')) answers.income = '100만원미만';
        else if (selectedText.includes('50~100')) answers.income = '100-250만원';
        else if (selectedText.includes('100~')) answers.income = '100-250만원';
        else answers.income = '250-450만원'; // Default
    }
    if (QD[QI].q.includes('가구') || QD[QI].q.includes('결혼')) {
        if (selectedText.includes('1인')) answers.household = '1인가구';
        else if (selectedText.includes('자녀')) answers.household = '자녀있음';
        else if (selectedText.includes('한부모')) answers.household = '한부모';
        else answers.household = '기타';
    }

    if (QI < QD.length - 1) {
        QI++;
        drawQ();
    } else {
        // Finish Quiz
        startLoading();
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

// Assuming `nextStep` function exists elsewhere or needs to be added.
// This is a placeholder for the `nextStep` function based on the provided diff.
// The actual `currentStep` variable would need to be defined in the scope where `nextStep` is called.
function nextStep(nextStepId) {
    // 단계별 이동 처리
    const currentStep = document.querySelector('.step.active');
    if (currentStep) currentStep.classList.remove('active');

    const nextStepEl = document.querySelector(`#step-${nextStepId}`);
    if (nextStepEl) {
        nextStepEl.classList.add('active'); // Ensure active class
        nextStepEl.style.display = 'block';
    } else {
        console.error('Next step element not found:', nextStepId);
    }

    // V13 Logic Hook: Step 3 is Category Selection
    if (nextStepId === 3 && typeof buildCatGrid === 'function') {
        buildCatGrid();
    }
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

console.log('SCRIPT FULLY LOADED');

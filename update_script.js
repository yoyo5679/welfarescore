const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

// 1. Update CATS
const oldCats = /var CATS = \{[\s\S]*?\};\n/;
const newCats = `var CATS = {
    housing: { label: '주거·독립', emoji: '🏠', sub: '무주택, 전월세, 주택구입 지원' },
    job: { label: '취업·창업', emoji: '💼', sub: '구직활동, 창업지원금, 직업훈련' },
    medical: { label: '의료·건강', emoji: '🏥', sub: '의료비, 심리상담, 건강검진' },
    child: { label: '임신·육아', emoji: '👶', sub: '출산, 보육료, 양육수당' },
    education: { label: '교육·학습', emoji: '📚', sub: '학자금대출, 국가장학금, 평생교육' },
    living: { label: '생활·생계', emoji: '💸', sub: '생계비, 통신·교통·에너지, 대출' }
};\n`;
content = content.replace(oldCats, newCats);

// 2. Update AGE_ORDER (Simplified)
const oldAgeOrder = /var AGE_ORDER = \{[\s\S]*?\};\n/;
const newAgeOrder = `var AGE_ORDER = {
    '10대이하': ['child', 'education', 'living', 'medical', 'housing', 'job'],
    '20대': ['job', 'education', 'living', 'housing', 'medical', 'child'],
    '30대': ['housing', 'job', 'child', 'living', 'medical', 'education'],
    '40대': ['child', 'education', 'job', 'housing', 'living', 'medical'],
    '50대': ['job', 'medical', 'living', 'housing', 'education', 'child'],
    '60대이상': ['medical', 'living', 'job', 'housing', 'child', 'education']
};\n`;
content = content.replace(oldAgeOrder, newAgeOrder);

// 3. Update Categories and map
const oldMap = /var map = \{[\s\S]*?\};\n\s*answers\.category = map\[cat\] \|\| '전체';/;
const newMap = `var map = {
        housing: '주거', job: '취업', medical: '의료',
        child: '육아', education: '교육', living: '생활비'
    };
    answers.category = map[cat] || '전체';`;
content = content.replace(oldMap, newMap);

const oldQS = /var QS = \{[\s\S]*?\};\n\nvar selCat/m;
const newQS = `var QS = {
    general: [ // Common quiz for all categories
        { q: '가구 소득 수준은 어느 정도인가요?', sub: '소득 기준으로 지원 범위가 결정돼요', ic: '💰', opts: ['100만원 미만', '100~250만원', '250~450만원', '450만원 이상'], ems: ['💸', '💵', '💳', '🏦'], sc: [15, 12, 8, 2] },
        { q: '현재 가족 구성이 어떻게 되나요?', sub: '가족 형태에 따라 맞춤 혜택이 있어요', ic: '👨👩��', opts: ['1인가구', '자녀있음 (일반가정)', '다자녀 가구', '한부모 가구', '신혼부부', '기타'], ems: ['🧍', '👨👩👧', '👨👩👧👦', '👩', '💍', '✅'], sc: [5, 5, 15, 15, 10, 2] },
        { q: '최근 특별히 해당하는 상황이 있으신가요?', sub: '구체적인 상황에 맞는 추가 지원이 있습니다', ic: '📋', opts: ['구직/실업 상태', '소상공인/자영업', '임산부', '위기가구(채무 등)', '해당 없음'], ems: ['💼', '🏪', '🤰', '💳', '✅'], sc: [15, 15, 15, 15, 0] }
    ]
};

var selCat`;
content = content.replace(oldQS, newQS);

// Update startQuiz generic loading
const oldStartQuizFallback = /QD = QS\[cat\] \|\| \[\];\s*\/\/ Fallback if no specific quiz data\s*if \(QD\.length === 0\) \{\s*\/\/ Use general questions if specific category missing\s*QD = QS\['lowincome'\];\s*\}/m;
const newStartQuizFallback = `// New Logic: Always load "general" cross-category quiz
    QD = QS['general'];`;
content = content.replace(oldStartQuizFallback, newStartQuizFallback);

fs.writeFileSync('script.js', content);
console.log('script.js updated.');

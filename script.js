const answers = {};
const TOTAL_STEPS = 5;

const REGION_NAMES = {
    'seoul': '서울', 'gyeonggi': '경기', 'incheon': '인천',
    'busan': '부산', 'daegu': '대구', 'ulsan': '울산',
    'daejeon': '대전', 'gwangju': '광주', 'sejong': '세종',
    'gangwon': '강원', 'chungbuk': '충북', 'chungnam': '충남',
    'jeonbuk': '전북', 'jeonnam': '전남', 'gyeongbuk': '경북',
    'gyeongnam': '경남', 'jeju': '제주'
};

// PC/모바일 구분 (V21)
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const linkTarget = isMobile ? '_self' : '_blank';

// ── 지역별 청년포털 & 복지포털 데이터 (V20) ──
const REGIONAL_PORTALS = {
    'national': [
        { name: '2026년 중앙정부 청년 월세지원', tag: '중앙정부', desc: '무주택 청년 대상 월 최대 20만원 임차료 지원 (최대 24개월 상시 신청)', applyUrl: 'https://www.bokjiro.go.kr/', monthlyAmount: 200000, icon: '🏠', relevance: 120 },
        { name: '국민취업지원제도 구직촉진수당 (인상)', tag: '중앙정부', desc: '2026년 월 60만원으로 인상된 구직 수당 및 맞춤형 취업 지원 서비스', applyUrl: 'https://www.kua.go.kr/', monthlyAmount: 600000, icon: '💼', relevance: 115 },
        { name: '청년미래적금 (2026년 6월 출시)', tag: '중앙정부', desc: '3년 만기 시 약 2,200만원 목돈 마련 지원 (연 소득 6천만원 이하 청년)', applyUrl: 'https://www.kinfa.or.kr/', monthlyAmount: 0, icon: '💰', relevance: 110 }
    ],
    'seoul': [
        // ── 25개 자치구별 특화 지원 정보 ──
        { name: '[종로구] 청년 숲 마켓 판매자 모집', tag: '종로구', desc: '청년 수공예가 및 창업가들의 판로 지원을 위한 플리마켓 참여 기회 제공', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '🌿', relevance: 110 },
        { name: '[중구] 을지유니크팩토리 청년성장프로젝트', tag: '중구', desc: '차(茶)와 함께하는 나를 마주하는 시간, 청년 심리 회복 및 성장 지원 프로그램', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67300&key=2309130006', monthlyAmount: 0, icon: '🍵', relevance: 115 },
        { name: '[용산구] 청년 국가자격증 응시료 지원', tag: '용산구', desc: '어학 및 국가기술자격증 시험 응시료 실비 지원 (1인당 연 최대 10만원)', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67159&key=2309130006', monthlyAmount: 0, icon: '📝', relevance: 120 },
        { name: '[성동구] 성동형 청년월세 지원사업', tag: '성동구', desc: '정부 지원 사각지대의 청년 1인가구에게 월 20만원, 최대 10개월간 월세 지원', applyUrl: 'https://www.sd.go.kr/', monthlyAmount: 200000, icon: '🏠', relevance: 125 },
        { name: '[광진구] 자립준비청년 맞춤형 패키지 지원', tag: '광진구', desc: '자립준비청년들의 안정적인 사회 정착을 위한 생활 생활 물품 및 지원금 패키지', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67720&key=2309130006', monthlyAmount: 0, icon: '🎁', relevance: 110 },
        { name: '[동대문구] 구립체육문화시설 프로그램 지원', tag: '동대문구', desc: '청년들의 건강한 여가 생활을 위한 체육 및 문화 강좌 수강료 지원 및 우선 접수', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67619&key=2309130006', monthlyAmount: 0, icon: '🎾', relevance: 105 },
        { name: '[중랑구] 슬기로운 중랑생활 이벤트', tag: '중랑구', desc: '제로웨이스트 실천 및 쓰레기 줄이기 참여 청년 대상 이벤트 및 경품 증정', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67669&key=2309130006', monthlyAmount: 0, icon: '♻️', relevance: 100 },
        { name: '[성북구] 청년 커뮤니티 "와글와글 성북마을"', tag: '성북구', desc: '청년 소모임 활동비 지원 및 지역 네트워크 형성 프로그램', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67756&key=2309130006', monthlyAmount: 0, icon: '👥', relevance: 115 },
        { name: '[강북구] 청년도전지원사업 참여자 모집', tag: '강북구', desc: '구직 단념 청년들의 사회 참여 및 취업 역량 강화를 위한 맞춤형 상담 및 교육', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67119&key=2309130006', monthlyAmount: 500000, icon: '🪜', relevance: 120 },
        { name: '[도봉구] 성인독서동아리 "달밤" 모집', tag: '도봉구', desc: '도봉문화정보도서관에서 운영하는 야간 독서 모임 및 독서 문화 활동 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '🌙', relevance: 105 },
        { name: '[노원구] 인상파 특별 전시 할인 혜택', tag: '노원구', desc: '노원문화재단 기획 전시 "인상파, 찬란한 순간들" 청년 특별 할인 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67753&key=2309130006', monthlyAmount: 0, icon: '🎨', relevance: 110 },
        { name: '[은평구] 청년 일자리사업 (인건비 지원)', tag: '은평구', desc: '은평구 내 기업과 청년 연계 및 기업에 채용 지원금(인건비 80%) 지원', applyUrl: 'https://www.ep.go.kr/www/selectEminwonView.do?notAncmtMgtNo=48183&key=748', monthlyAmount: 0, icon: '💼', relevance: 125 },
        { name: '[서대문구] 고혈압 당뇨 관리 공부방', tag: '서대문구', desc: '청년 건강 관리를 위한 만성질환 예방 교육 및 식단 상담 서비스', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '🍎', relevance: 100 },
        { name: '[마포구] 청년 일자리 매칭 데이', tag: '마포구', desc: '마포구 우수 기업과 청년 구직자의 직접 면접 및 채용 연계 행사', applyUrl: 'https://www.mapo.go.kr/site/main/content/mapo05050401', monthlyAmount: 0, icon: '🤝', relevance: 120 },
        { name: '[양천구] 청년점포 & 청년창업가 모집', tag: '양천구', desc: '전통시장 내 청년 점포 입점 지원 및 창업 초기 자금 지원 프로그램', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67750&key=2309130006', monthlyAmount: 0, icon: '🏪', relevance: 120 },
        { name: '[강서구] 곰달래도서관 개관기념 행사', tag: '강서구', desc: '강서구 청년 및 주민을 위한 인문학 강연, 공연 등 문화 행사 안내', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67670&key=2309130006', monthlyAmount: 0, icon: '📚', relevance: 105 },
        { name: '[구로구] 에너지 절약 에코마일리지', tag: '구로구', desc: '에너지 사용량 절감 시 마일리지를 적립하여 온누리상품권 등으로 교환 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67364&key=2309130006', monthlyAmount: 0, icon: '🔋', relevance: 100 },
        { name: '[금천구] 전세피해 임차인 법률 지원', tag: '금천구', desc: '전세 사기 등 피해를 입은 청년 임차인을 위한 전문 법률 상담 및 대응 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67736&key=2309130006', monthlyAmount: 0, icon: '⚖️', relevance: 115 },
        { name: '[영등포구] 클라이밍 & 러닝 참여자 모집', tag: '영등포구', desc: '청년들의 건강한 신체 활동을 위한 클라이밍 및 러닝 동호회 활동 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67640&key=2309130006', monthlyAmount: 0, icon: '🧗', relevance: 110 },
        { name: '[동작구] 동작 청년 카페 운영 지원', tag: '동작구', desc: '청년 창업가 대상 동작구 내 카페 공간 제공 및 운영 컨설팅 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '☕', relevance: 115 },
        { name: '[관악구] 청년 네트워크 위원 모집', tag: '관악구', desc: '청년 정책 수립 과정에 직접 참여하는 관악구 청년 거버넌스 위원 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '📢', relevance: 110 },
        { name: '[서초구] 프로젝트 리더 선정 지원', tag: '서초구', desc: '서초구 청년들이 직접 지역 사회에 필요한 프로젝트를 기획하고 실행할 리더 모집', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '👔', relevance: 115 },
        { name: '[강남구] 사회복지 공모사업 지원', tag: '강남구', desc: '강남구 내 복지 사각지대 해소를 위한 참신한 사회복지 사업 아이디어 공모 및 지원', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 0, icon: '🏛️', relevance: 110 },
        { name: '[송파구] AI 면접 무료 체험 신청', tag: '송파구', desc: '취업 준비 청년을 위한 AI 역량 검사 및 면접 체험 시스템 무료 제공', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/view.do?sprtInfoId=67251&key=2309130006', monthlyAmount: 0, icon: '🤖', relevance: 120 },
        { name: '[강동구] 스텝업 프로젝트 참여자 모집', tag: '강동구', desc: '강동구 구직 청년들의 진로 탐색 및 실무 역량 강화를 위한 스텝업 프로그램', applyUrl: 'https://youth.seoul.go.kr/infoData/sprtInfo/list.do?key=2309130006', monthlyAmount: 500000, icon: '🪜', relevance: 115 },

        // ── 서울시 공통 포털 ──
        { name: '서울청년포털 (청년몽땅정보통)', tag: '서울특별시', desc: '서울시 청년 정책 원스톱 포털. 주거·취업·교육·문화 분야 지원사업 한눈에 확인!', applyUrl: 'https://youth.seoul.go.kr/', monthlyAmount: 0, icon: '🏙️', relevance: 100 },
        { name: '서울시 청년수당', tag: '서울특별시', desc: '미취업 만 19~34세 서울 청년에게 최대 6개월간 월 50만원 지원', applyUrl: 'https://youth.seoul.go.kr/site/main/content/youth_pay', monthlyAmount: 500000, icon: '💰', relevance: 98 },
        { name: '서울형 강소기업 취업지원', tag: '서울특별시', desc: '중소기업 취업 청년 대상 인턴십·연계 정규직 채용 및 장려금 지원', applyUrl: 'https://youth.seoul.go.kr/', monthlyAmount: 300000, icon: '💼', relevance: 90 }
    ],
    'gyeonggi': [
        { name: '경기도 청년기본소득 (2026)', tag: '경기도', desc: '만 24세 경기 청년에게 연 100만원 지원 (거주지 학원비 사용 가능)', applyUrl: 'https://www.jobaba.net/', monthlyAmount: 83333, icon: '💳', relevance: 125 },
        { name: '경기청년 메디케어 플러스 (신설)', tag: '경기도', desc: '미취업·저소득 청년 대상 건강검진 및 예방접종비 최대 20만원 지원', applyUrl: 'https://www.jobaba.net/', monthlyAmount: 0, icon: '🏥', relevance: 110 },
        { name: '경기도 청년 갭이어 프로그램', tag: '경기도', desc: '진로 탐색 프로젝트 지원금(최대 500만원) 및 역량 강화 프로그램 지원', applyUrl: 'https://www.jobaba.net/', monthlyAmount: 200000, icon: '🌱', relevance: 88 }
    ],
    'incheon': [
        { name: '인천광역시 청년포털', tag: '인천광역시', desc: '인천 청년 맞춤형 지원정책 통합포털. 주거·일자리·창업 지원 안내', applyUrl: 'https://youth.incheon.go.kr/', monthlyAmount: 0, icon: '✈️', relevance: 100 },
        { name: '인천 청년도약장려금', tag: '인천광역시', desc: '만 18~34세 인천 거주 미취업 청년 대상 구직활동 지원금 지급', applyUrl: 'https://youth.incheon.go.kr/', monthlyAmount: 500000, icon: '💰', relevance: 95 }
    ],
    'busan': [
        { name: '부산 청년모두가(家) 주거비 지원', tag: '부산광역시', desc: '공공임대주택 거주 청년 및 신혼부부 대상 월 임대료 지원 (최대 6-7년)', applyUrl: 'https://youth.busan.go.kr/', monthlyAmount: 150000, icon: '🏠', relevance: 120 },
        { name: '부산 청년 머물자리론 (확대)', tag: '부산광역시', desc: '임차보증금 최대 1억원 대출 및 이자 지원 (심사 기간 5일로 단축)', applyUrl: 'https://youth.busan.go.kr/', monthlyAmount: 0, icon: '🏦', relevance: 115 },
        { name: '부산청년플랫폼 (BYP)', tag: '부산광역시', desc: '부산 청년 정책·일자리·문화·주거 원스톱 지원 플랫폼', applyUrl: 'https://youth.busan.go.kr/', monthlyAmount: 0, icon: '🌊', relevance: 100 }
    ],
    'daegu': [
        { name: '대구청년센터 (청년드림)', tag: '대구광역시', desc: '대구 청년을 위한 일자리·창업·주거·문화 복합지원 플랫폼', applyUrl: 'https://www.daegu.go.kr/youth/', monthlyAmount: 0, icon: '🍎', relevance: 100 },
        { name: '대구형 청년 일자리 사업', tag: '대구광역시', desc: '대구 지역 중소기업 취업 청년 대상 임금 보전 및 재직장려금 지원', applyUrl: 'https://www.daegu.go.kr/youth/', monthlyAmount: 200000, icon: '💼', relevance: 92 }
    ],
    'gwangju': [
        { name: '광주광역시 청년센터', tag: '광주광역시', desc: '광주 청년 복지정책 종합안내. 주거·취업·창업·문화 지원 정보 제공', applyUrl: 'https://www.gwangju.go.kr/youth/', monthlyAmount: 0, icon: '🎨', relevance: 100 },
        { name: '광주청년드림통장', tag: '광주광역시', desc: '근로·사업소득이 있는 청년이 저축하면 시에서 매칭 적립해주는 청년지원 사업', applyUrl: 'https://www.gwangju.go.kr/youth/', monthlyAmount: 200000, icon: '💳', relevance: 95 }
    ],
    'daejeon': [
        { name: '대전광역시 청년포털', tag: '대전광역시', desc: '대전 청년 지원정책. 일자리·주거·창업·문화 맞춤 지원 안내', applyUrl: 'https://www.daejeon.go.kr/youth/', monthlyAmount: 0, icon: '🔬', relevance: 100 },
        { name: '대전 청년 구직활동지원금', tag: '대전광역시', desc: '취업을 준비하는 대전 청년에게 구직활동 비용 지원', applyUrl: 'https://www.daejeon.go.kr/youth/', monthlyAmount: 300000, icon: '💰', relevance: 90 }
    ],
    'ulsan': [
        { name: '울산청년센터', tag: '울산광역시', desc: '울산 청년 지원정책 및 취업·창업·주거 정보 안내 센터', applyUrl: 'https://www.ulsan.go.kr/youth/', monthlyAmount: 0, icon: '🐋', relevance: 100 },
        { name: '울산 청년 취업장려금', tag: '울산광역시', desc: '울산 지역 기업 취업 청년 대상 정착금 및 장려금 지원', applyUrl: 'https://www.ulsan.go.kr/youth/', monthlyAmount: 200000, icon: '💼', relevance: 90 }
    ],
    'sejong': [
        { name: '세종시 청년지원센터', tag: '세종특별자치시', desc: '세종시 청년 정책·일자리·주거 지원 통합 안내', applyUrl: 'https://www.sejong.go.kr/youth/', monthlyAmount: 0, icon: '🏢', relevance: 100 },
        { name: '세종시 청년 월세지원', tag: '세종특별자치시', desc: '세종시 거주 무주택 청년 대상 월세 일부 지원', applyUrl: 'https://www.sejong.go.kr/youth/', monthlyAmount: 200000, icon: '🏠', relevance: 88 }
    ],
    'gangwon': [
        { name: '강원도 청년센터', tag: '강원특별자치도', desc: '강원 청년 창업·취업·귀촌 지원 종합 정보 포털', applyUrl: 'https://www.gw.go.kr/youth/', monthlyAmount: 0, icon: '⛷️', relevance: 100 },
        { name: '강원 청년 창업지원 (강소연)', tag: '강원특별자치도', desc: '강원 청년 창업가 대상 초기 창업자금 및 멘토링 지원', applyUrl: 'https://www.gw.go.kr/youth/', monthlyAmount: 300000, icon: '🚀', relevance: 92 }
    ],
    'chungbuk': [
        { name: '충청북도 청년지원센터', tag: '충청북도', desc: '충북 청년 취업·창업·주거·복지 지원 정책 안내', applyUrl: 'https://www.cb.go.kr/youth/', monthlyAmount: 0, icon: '🏞️', relevance: 100 },
        { name: '충북 청년 취업지원', tag: '충청북도', desc: '충북 지역 기업 취업 청년 대상 정착장려금 및 인턴십 지원', applyUrl: 'https://www.cb.go.kr/youth/', monthlyAmount: 200000, icon: '💼', relevance: 88 }
    ],
    'chungnam': [
        { name: '충청남도 청년센터', tag: '충청남도', desc: '충남 청년 맞춤형 정책. 일자리·주거·복지·교육 지원 안내', applyUrl: 'https://www.chungnam.go.kr/youth/', monthlyAmount: 0, icon: '🌅', relevance: 100 },
        { name: '충남 청년 행복카드', tag: '충청남도', desc: '충남 거주 청년 대상 문화·여가·교통 할인 혜택 제공 카드', applyUrl: 'https://www.chungnam.go.kr/youth/', monthlyAmount: 100000, icon: '🎴', relevance: 88 }
    ],
    'jeonbuk': [
        { name: '전북특별자치도 청년센터', tag: '전북특별자치도', desc: '전북 청년 지원정책 포털. 주거·일자리·창업 등 맞춤 지원 안내', applyUrl: 'https://www.jb.go.kr/youth/', monthlyAmount: 0, icon: '🍚', relevance: 100 },
        { name: '전주시 청년지원 프로그램', tag: '전주시', desc: '전주 청년을 위한 취업·창업·주거·문화 특화 지원 사업', applyUrl: 'https://www.jeonju.go.kr/youth/', monthlyAmount: 0, icon: '🏯', relevance: 98 },
        { name: '전북 청년 희망공제 (적금 매칭)', tag: '전북특별자치도', desc: '전북 중소기업 재직 청년이 저축하면 기업·도가 매칭 적립해주는 목돈 마련 사업', applyUrl: 'https://www.jb.go.kr/youth/', monthlyAmount: 240000, icon: '💰', relevance: 96 },
        { name: '전북 청년 월세 특별지원', tag: '전북특별자치도', desc: '무주택 청년 1인 가구 대상 월세 지원 (최대 월 20만원, 12개월)', applyUrl: 'https://www.jb.go.kr/youth/', monthlyAmount: 200000, icon: '🏠', relevance: 93 }
    ],
    'jeonnam': [
        { name: '전라남도 청년센터', tag: '전라남도', desc: '전남 청년 정착·취업·창업·귀농귀촌 종합 지원 포털', applyUrl: 'https://www.jeonnam.go.kr/youth/', monthlyAmount: 0, icon: '🥘', relevance: 100 },
        { name: '전남 청년 농어촌 정착지원금', tag: '전라남도', desc: '전남 농어촌 정착 청년 대상 5년간 매월 최대 100만원 지원', applyUrl: 'https://www.jeonnam.go.kr/youth/', monthlyAmount: 1000000, icon: '🌾', relevance: 95 }
    ],
    'gyeongbuk': [
        { name: '경상북도 청년정책포털 (경북청년)', tag: '경상북도', desc: '경북 청년 취업·창업·주거·귀농 지원 정책 통합 안내', applyUrl: 'https://youth.gyeongbuk.go.kr/', monthlyAmount: 0, icon: '🏰', relevance: 100 },
        { name: '경북 청년 내일채움공제 플러스', tag: '경상북도', desc: '경북 중소기업 청년 재직자 목돈 마련 지원 (기업·도 매칭)', applyUrl: 'https://youth.gyeongbuk.go.kr/', monthlyAmount: 300000, icon: '💰', relevance: 95 }
    ],
    'gyeongnam': [
        { name: '경상남도 청년센터', tag: '경상남도', desc: '경남 청년 지원정책. 취업·창업·주거 분야 맞춤 안내 포털', applyUrl: 'https://www.gyeongnam.go.kr/youth/', monthlyAmount: 0, icon: '⚓', relevance: 100 },
        { name: '경남 청년 구직활동지원금', tag: '경상남도', desc: '경남 거주 미취업 청년 대상 구직활동비 월 최대 30만원 지원', applyUrl: 'https://www.gyeongnam.go.kr/youth/', monthlyAmount: 300000, icon: '💼', relevance: 92 }
    ],
    'jeju': [
        { name: '제주청년센터 (제주청년)', tag: '제주특별자치도', desc: '제주 청년 경제·주거·문화·교육 지원 종합 포털', applyUrl: 'https://youth.jeju.go.kr/', monthlyAmount: 0, icon: '🏝️', relevance: 100 },
        { name: '제주 청년 이주지원금', tag: '제주특별자치도', desc: '제주 이주 청년에게 정착 지원금 및 주거비 일부 지원', applyUrl: 'https://youth.jeju.go.kr/', monthlyAmount: 200000, icon: '✈️', relevance: 92 },
        { name: '제주 청년 창업지원 (탐나는 청년)', tag: '제주특별자치도', desc: '제주 청년 창업가 대상 창업자금·교육·멘토링·공간 지원', applyUrl: 'https://youth.jeju.go.kr/', monthlyAmount: 300000, icon: '🚀', relevance: 90 }
    ]
};

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

// welfareData is now provided by generated_data.js
// 옵션 선택
function selectOption(el, key) {
    const parent = el.closest('.options');

    // 가구 상황(household) 다중 선택 처리 로직
    if (key === 'household') {
        el.classList.toggle('selected');

        // 기타 버튼 클릭 시 다른 항목 해제
        if (el.dataset.val === '기타' && el.classList.contains('selected')) {
            parent.querySelectorAll('.opt-btn').forEach(b => {
                if (b !== el) b.classList.remove('selected');
            });
        }
        // 다른 버튼 클릭 시 기타 버튼 해제
        else if (el.dataset.val !== '기타' && el.classList.contains('selected')) {
            const othersBtn = parent.querySelector('.opt-btn[data-val="기타"]');
            if (othersBtn) othersBtn.classList.remove('selected');
        }

        const selectedBtns = parent.querySelectorAll('.opt-btn.selected');
        answers[key] = Array.from(selectedBtns).map(b => b.dataset.val);

        // 선택 항목이 하나도 없을 경우 배열 비우기 및 비활성화 처리
        const stepNum = el.closest('.step').id.replace('step-', '');
        const btn = document.getElementById('next' + stepNum);
        if (btn) btn.disabled = answers[key].length === 0;
        return; // 다중 선택 탭은 여기서 종료
    }

    // 단일 선택 로직 (기존)
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
                btn.dataset.val = sub;
                btn.onclick = function () { selectOption(this, 'subRegion'); };
                subOpts.appendChild(btn);
            });
            subArea.style.display = 'block';

            // 도 선택 시 시/군/구 목록으로 자동 스크롤 (V17)
            subArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // 다음 버튼 비활성화 (시군구 선택 대기)
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

    // 첫 페이지를 제외하고는 중앙으로 자동 스크롤 (V16)
    if (num > 1) {
        const nextEl = document.getElementById('step-' + num);
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Ensure we start at the top, even with #step-1 in URL
window.scrollTo(0, 0);
setTimeout(() => window.scrollTo(0, 0), 0);
setTimeout(() => window.scrollTo(0, 0), 100);

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
    // answers.household가 다중 선택(Array)인지 확인 후 처리 (V15 멀티셀렉트)
    const activeHouseholds = Array.isArray(answers.household) ? answers.household : [answers.household || '1인가구'];
    if (activeHouseholds.some(h => ['다자녀', '한부모', '자녀있음'].includes(h))) needScore += 10;
    if (activeHouseholds.includes('1인가구') || activeHouseholds.includes('신혼부부')) needScore += 5;

    // 데이터 준비
    const incomeMap = { '100만원미만': 50, '100-250만원': 200, '250-450만원': 350, '450만원이상': 700 };
    const incomeNum = incomeMap[answers.income] || 300;
    const householdMap = { '1인가구': 1, '신혼부부': 2, '일반부부': 2, '자녀있음': 3, '다자녀': 4, '한부모': 2, '자립준비청년': 1, '청년': 1, '기타': 2 };
    // 다중 선택 시 가장 큰 값을 기준으로 가구원 수 결정
    let familyCount = 1;
    activeHouseholds.forEach(h => {
        if (householdMap[h] && householdMap[h] > familyCount) familyCount = householdMap[h];
    });
    // 호환성을 위해 condition 체크용 fake Data는 원본 answers를 넘김 (condition에서 includes로 처리)
    const data = { ...answers, incomeNum, familyCount, household: activeHouseholds };

    // 3. 혜택 매칭 및 가산점
    let potentialScore = 0;
    welfareData.forEach(item => {
        // 카테고리 필터링 (V11 Smart Filter)
        let isCategoryMatch = true;
        if (answers.category && answers.category !== '전체') {
            if (answers.category === '청년') {
                // '청년' 카테고리 선택 시: 이름/설명/태그에 '청년'이 포함되거나 youthCenter 데이터인 경우 매칭
                const isYouthRelated = item.name.includes('청년') ||
                    (item.description && item.description.includes('청년')) ||
                    (item.tag && item.tag.includes('청년')) ||
                    item.name.includes('[온통청년]');
                if (!isYouthRelated && !item.isLocal) isCategoryMatch = false;
            } else {
                if (item.category !== answers.category && !item.isLocal) isCategoryMatch = false;
            }
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

    // 지역별 및 우선순위 정렬 로직
    matched.sort((a, b) => {
        let scoreA = a.relevance || 0;
        let scoreB = b.relevance || 0;

        // 1. 온통청년(Youth Center) 데이터 가산점 (가장 공신력 있고 혜택이 큼)
        if (a.name.includes('[온통청년]')) scoreA += 2000;
        if (b.name.includes('[온통청년]')) scoreB += 2000;

        // 2. 핵심 정책 (내일채움공제 등) 추가 가산점
        if (a.name.includes('내일채움공제')) scoreA += 5000;
        if (b.name.includes('내일채움공제')) scoreB += 5000;

        // 3. 지역별 정렬 로직 (기존 유지)
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
    for (let i = 0; i < 50; i++) {
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

    renderUserTags(); // V24: 사용자 선택 키워드 표시

    history.pushState({ step: 'result' }, '', '#result');

    // 점수 대신 혜택 개수 애니메이션
    animateNumber('resultBenefitCount', benefits.length, 1500);

    // 메시지 업데이트
    let title = '복주머니가 혜택으로 가득 찼어요! 🧧';
    if (score < 40) title = '복주머니에 담을 혜택을 더 찾아볼까요?';
    else if (score < 70) title = '실속 있는 복지 혜택이 가득 담겼네요!';
    else if (score < 90) title = '와! 복주머니가 묵직할 정도로 혜택이 많아요!';

    document.getElementById('resultTitle').textContent = title;

    // 혜택 분류
    currentBenefits = { custom: [], local: [], agency: [] };

    const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
    const regionName = regionBtn ? regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim() : '내 지역';
    const subRegionBtn = document.querySelector(`.opt-btn.selected[onclick*="subRegion"]`);
    const subRegionName = subRegionBtn ? subRegionBtn.innerText : '';
    const selectedRegion = answers.region || '';

    // ── V23: 중앙정부 & 지역별 청년포털 데이터 자동 주입 ──
    // 1. 중앙정부 정책 (항상 포함)
    if (REGIONAL_PORTALS['national']) {
        REGIONAL_PORTALS['national'].forEach(portal => {
            currentBenefits.local.push({ ...portal, isLocal: true, category: '생활비' });
        });
    }

    // 2. 선택 지역 정책
    if (selectedRegion && REGIONAL_PORTALS[selectedRegion]) {
        REGIONAL_PORTALS[selectedRegion].forEach(portal => {
            // 필터링 로직 (V22): 태그가 광역지역명과 일치하거나, 선택된 시군구명과 일치하는 경우만 노출
            const isRegionMatch = portal.tag === regionName;
            const isSubRegionMatch = subRegionName && portal.tag.includes(subRegionName);
            const isGlobal = portal.tag === '전체' || portal.tag === '중앙정부';

            // 카테고리 매칭 (V24): '청년' 카테고리일 경우 지역 혜택은 대부분 청년용이므로 패스
            let isPortalCategoryMatch = true;
            if (answers.category && answers.category !== '전체' && answers.category !== '청년') {
                if (portal.category && portal.category !== answers.category) isPortalCategoryMatch = false;
            }

            if ((isRegionMatch || isSubRegionMatch || isGlobal) && isPortalCategoryMatch) {
                currentBenefits.local.push({
                    ...portal,
                    isLocal: true,
                    category: '생활비'
                });
            }
        });
    }

    // 중앙정부 데이터 중 지역 매칭된 isLocal 항목도 추가
    benefits.forEach(b => {
        if (['초록우산', '굿네이버스', '이랜드복지재단', '희망친구기아대책'].includes(b.tag)) {
            currentBenefits.agency.push(b);
        } else if (b.isLocal) {
            // condition이 true인 경우만 (false 하드코딩 제외)
            currentBenefits.local.push(b);
        } else {
            currentBenefits.custom.push(b);
        }
    });

    // ── V20: 자립준비청년 선택 시 전용 혜택 카드 맞춤혜택 최상단 추가 ──
    // 다중 선택(Array) 대응
    if (Array.isArray(answers.household) ? answers.household.includes('자립준비청년') : answers.household === '자립준비청년') {
        currentBenefits.custom.unshift({
            name: '자립준비청년 맞춤 지원사업 안내',
            tag: '아동권리보장원',
            desc: '보호종료 후 자립을 준비하는 청년을 위한 주거·취업·생활·심리 맞춤 지원사업 통합 포털. 나에게 맞는 지원을 한눈에 확인하세요.',
            applyUrl: 'https://jaripon.ncrc.or.kr/home/kor/support/projectMng/index.do',
            monthlyAmount: 0,
            icon: '🌱',
            relevance: 9999
        });
        currentBenefits.custom.unshift({
            name: '자립준비청년 자립수당 (월 40만원)',
            tag: '아동권리보장원',
            desc: '보호종료 후 5년 이내 자립준비청년에게 자립활동비로 매월 40만원 지급. 만 24세 이하 대상.',
            applyUrl: 'https://jaripon.ncrc.or.kr/home/kor/support/projectMng/index.do',
            monthlyAmount: 400000,
            icon: '💰',
            relevance: 9998
        });
    }

    // 지역별 정렬 최적화 (relevance 높은 것 상단)
    currentBenefits.local.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    // 지역지원 탭 버튼에 배지 표시
    const localTabBtn = document.querySelector('.tab-btn[onclick*="local"]');
    if (localTabBtn && currentBenefits.local.length > 0) {
        localTabBtn.innerHTML = `📍 지역 지원 <span style="background:#ef4444;color:white;border-radius:10px;padding:1px 6px;font-size:11px;margin-left:4px;">${currentBenefits.local.length}</span>`;
    }

    // 기본 탭(맞춤 혜택) 렌더링
    renderBenefits('custom');
}

// 혜택 리스트 렌더링
function renderBenefits(category) {
    const list = document.getElementById('benefitList');
    const mapWrapper = document.getElementById('mapWrapper');
    list.innerHTML = '';

    // 지도 표시 제어
    if (category === 'agency') {
        mapWrapper.style.display = 'block';
        initMap(); // 지도 초기화
    } else {
        mapWrapper.style.display = 'none';
    }

    const items = currentBenefits[category];
    if (!items || items.length === 0) {
        if (category !== 'agency') {
            list.innerHTML = '<p style="text-align:center; padding:40px; color:#64748b;">관련된 혜택이 아직 없습니다.</p>';
        }
        return;
    }

    items.forEach(b => {
        const card = document.createElement('div');
        card.className = 'benefit-card animate-fade';

        // 금액 표시 포맷
        const amountText = b.monthlyAmount ? `최대 ${Math.round(b.monthlyAmount).toLocaleString()}원` : '혜택 확인 필요';

        // 블로그 검색 URL: 혜택명 키워드로 자동 연결
        const blogKeyword = encodeURIComponent(b.name.replace(/[\[\]]/g, '').trim());
        const blogUrl = `https://10000nanzip.tistory.com/search/${blogKeyword}`;

        card.innerHTML = `
            <div class="agency-badge">🏛️ ${b.tag}</div>
            <div class="benefit-title">${b.name}</div>
            <div class="benefit-desc">${b.desc || b.description}</div>
            <div class="benefit-meta">
                <div class="benefit-amount">💰 ${amountText}</div>
                <a href="${b.applyUrl || '#'}" target="${linkTarget}" class="benefit-link-btn">신청하기 ➔</a>
            </div>
            <a href="${blogUrl}" target="${linkTarget}" class="blog-cta-btn">
                📖 신청 꿀팁 블로그에서 확인하기
            </a>
        `;
        list.appendChild(card);
    });
}

// ── 내 주변 지도 기능 (V13) ──
let kakaoMap = null;
let ps = null;
let infowindow = null;
let markers = []; // 지도의 모든 마커를 추적하기 위한 배열 (V15)

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

function initMap() {
    const mapStatus = document.getElementById('mapStatus');

    if (typeof kakao === 'undefined' || !kakao.maps) {
        mapStatus.innerHTML = '⚠️ 지도 라이브러리를 불러오는 중입니다... (잠시만 기다려주세요)';
        // 1초 후 재시도
        setTimeout(initMap, 1000);

        // 도메인 등록 안내를 위한 콘솔 로그 추가
        console.warn('Kakao Maps SDK not loaded. Please check if your domain (e.g., http://localhost:8080) is registered in Kakao Developers Console.');
        return;
    }

    const regionName = REGION_NAMES[answers.region] || '';
    const subRegionName = answers.subRegion || '';
    const fullAddr = `${regionName} ${subRegionName}`.trim();

    if (!fullAddr) {
        mapStatus.innerHTML = '⚠️ 지역 정보가 선택되지 않았습니다.';
        return;
    }

    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(fullAddr, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const locPosition = new kakao.maps.LatLng(result[0].y, result[0].x);

            if (!kakaoMap) {
                const container = document.getElementById('map');
                const options = { center: locPosition, level: 5 };
                kakaoMap = new kakao.maps.Map(container, options);
                ps = new kakao.maps.services.Places(kakaoMap);
                infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

                // 지도가 이동하거나 확대/축소되면 새로 검색 (V15)
                kakao.maps.event.addListener(kakaoMap, 'idle', function () {
                    searchNearbyAgencies();
                });
            } else {
                kakaoMap.setCenter(locPosition);
            }

            mapStatus.innerHTML = `📍 [${fullAddr}] 주변의 사회복지 시설 및 관공서를 찾았습니다.`;
            searchNearbyAgencies();
        } else {
            mapStatus.innerHTML = '⚠️ 선택하신 지역의 위치를 찾을 수 없습니다.';
        }
    });
}

function searchNearbyAgencies() {
    if (!ps) return;

    // 기존 마커 제거 (새로운 지역 검색 시 겹침 방지 V15)
    clearMarkers();

    const callback = (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayMarker(data[i]);
            }
        }
    };

    // 1. 카테고리 검색: KB6(사회복지시설), PO3(공공기관)
    ps.categorySearch('KB6', callback, { useMapBounds: true });
    ps.categorySearch('PO3', callback, { useMapBounds: true });

    // 2. 키워드 검색 추가 (사회복지관 등 상세 기관 확보)
    const regionBtn = document.querySelector(`.opt-btn.selected[onclick*="region"]`);
    const regionName = regionBtn ? regionBtn.innerText.replace(/[^가-힣]/g, '').trim() : '';
    const subRegionBtn = document.querySelector(`.opt-btn.selected[onclick*="subRegion"]`);
    const subRegionName = subRegionBtn ? subRegionBtn.innerText : '';
    const baseKeyword = `${regionName} ${subRegionName}`.trim();

    ps.keywordSearch(`${baseKeyword} 복지관`, callback, { useMapBounds: true });
    ps.keywordSearch(`${baseKeyword} 복지센터`, callback, { useMapBounds: true });
    ps.keywordSearch(`${baseKeyword} 센터`, callback, { useMapBounds: true });
}

function displayMarker(place) {
    const marker = new kakao.maps.Marker({
        map: kakaoMap,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    // 마커 배열에 추가하여 나중에 지울 수 있도록 함
    markers.push(marker);

    kakao.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(kakaoMap, marker);
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
    intro: "안녕 하세요! 당신의 든든한 지원군, **로거**예요! 🐶✨<br>복주머니 리포트는 잘 보셨나요? 궁금한 게 있다면 무엇이든 편하게 물어봐 주세요!",
    options: [
        { text: "💰 제가 놓친 돈이 더 있을까요?", answer: "지금 입력하신 정보로는 최적의 혜택을 다 찾아드렸어요! 혹시 가족 관계에 변화가 생기거나, 소득 기준이 바뀌면 새로운 혜택이 뜰 수 있으니 가끔씩 저를 다시 찾아주세요! 😉" },
        { text: "📝 신청 방법이 궁금해요!", answer: "각 혜택 카드에 있는 **'신청하기'** 버튼을 누르면 바로 연결해 드려요! 준비물이 복잡할 땐 제가 블로그에 꿀팁을 정리해둘게요. 걱정 마세요! 🙌" },
        { text: "📊 제 점수, 이 정도면 괜찮은 건가요?", answer: "와우! 상위권에 속하는 아주 훌륭한 점수예요! 👍 평소에 복지 정보에 관심이 많으시군요? 부족한 부분은 제가 채워드릴 테니 함께 만점을 향해 가봐요!" }
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

    // 메시지 추가 후 항상 최하단으로 스크롤 (V17 개선)
    requestAnimationFrame(() => {
        content.scrollTop = content.scrollHeight;
    });
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

    // 옵션 표시 후에도 최하단으로 스크롤 (V17 개선)
    requestAnimationFrame(() => {
        content.scrollTop = content.scrollHeight;
    });
}

// 챗봇 자유 검색 (V20)
function handleChatInput() {
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    if (!query) return;

    addMessage('user', query);
    input.value = '';

    setTimeout(() => {
        const results = chatSearch(query);
        if (results.length === 0) {
            addMessage('bot', `"${query}"에 대한 혜택을 찾지 못했어요 😅<br>더 구체적으로 입력해보시거나, <a href="https://10000nanzip.tistory.com" target="${linkTarget}" style="color:var(--primary);font-weight:700;">블로그</a>에서 검색해보세요!`);
        } else {
            let html = `<b>🔍 "${query}"</b> 관련 혜택 <b>${results.length}건</b>을 찾았어요!<br><br>`;
            results.slice(0, 4).forEach(b => {
                const blogKeyword = encodeURIComponent(b.name.replace(/[\[\]]/g, '').trim());
                html += `<div style="background:#f1f5f9;border-radius:10px;padding:10px 12px;margin-bottom:8px;">
                    <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${b.icon || '💎'} ${b.name}</div>
                    <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${(b.desc || b.description || '').substring(0, 50)}...</div>
                    <a href="https://10000nanzip.tistory.com/search/${blogKeyword}" target="${linkTarget}" style="font-size:11px;color:var(--primary);font-weight:700;">📖 블로그에서 상세보기 →</a>
                </div>`;
            });
            if (results.length > 4) html += `<div style="font-size:12px;color:#64748b;">외 ${results.length - 4}건 더 있어요. 결과 페이지에서 확인해보세요!</div>`;
            addMessage('bot', html);
        }
    }, 600);
}

// 키워드 기반 혜택 검색
function chatSearch(query) {
    const ageMap = { '10대': '10대이하', '20대': '20대', '30대': '30대', '40대': '40대', '50대': '50대', '60대': '60대이상' };
    const categoryMap = {
        '주거': '주거', '집': '주거', '전세': '주거', '월세': '주거',
        '취업': '취업', '일자리': '취업', '취직': '취업', '창업': '취업',
        '육아': '육아', '아이': '육아', '보육': '육아', '출산': '육아',
        '교육': '교육', '학비': '교육', '장학': '교육',
        '의료': '의료', '건강': '의료', '병원': '의료',
        '생활비': '생활비', '생계': '생활비', '지원금': '생활비'
    };
    const householdMap = {
        '1인': '1인가구', '혼자': '1인가구', '독신': '1인가구',
        '신혼': '신혼부부', '결혼': '신혼부부',
        '일반부부': '일반부부', '기혼': '일반부부', '부부': '일반부부',
        '자녀': '자녀있음', '아이': '자녀있음',
        '다자녀': '다자녀', '3명': '다자녀',
        '한부모': '한부모', '미혼모': '한부모', '미혼부': '한부모',
        '청년': '청년', '자립준비': '자립준비청년'
    };

    let targetAge = null, targetCategory = null, targetHousehold = null;

    Object.entries(ageMap).forEach(([k, v]) => { if (query.includes(k)) targetAge = v; });
    Object.entries(categoryMap).forEach(([k, v]) => { if (query.includes(k)) targetCategory = v; });
    Object.entries(householdMap).forEach(([k, v]) => { if (query.includes(k)) targetHousehold = v; });

    // 아무 키워드도 없으면 빈 배열
    if (!targetAge && !targetCategory && !targetHousehold) return [];

    const incomeNum = 200; // 검색 시 기본값 200만원 가정
    const familyCount = 1;
    const fakeData = {
        age: targetAge || answers.age || '30대',
        household: targetHousehold ? [targetHousehold] : (Array.isArray(answers.household) ? answers.household : [answers.household || '1인가구']),
        income: answers.income || '100-250만원',
        category: targetCategory || '전체',
        region: answers.region || 'seoul',
        subRegion: answers.subRegion || '',
        incomeNum, familyCount
    };

    return welfareData.filter(item => {
        try {
            let catMatch = true;
            if (targetCategory) catMatch = item.category === targetCategory;
            return item.condition(fakeData) && catMatch;
        } catch { return false; }
    }).slice(0, 8);
}

// 엔터키로 전송
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleChatInput();
        });
    }
});

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

// ── V24: 사용자 선택 키워드(태그) 렌더링 ──
function renderUserTags() {
    const container = document.getElementById('userTagContainer');
    if (!container) return;
    container.innerHTML = '';

    const tags = [];

    // 1. 연령대
    const ageBtn = document.querySelector('.opt-btn.selected[onclick*="age"]');
    if (ageBtn) tags.push(ageBtn.innerText.trim());

    // 2. 가구 상황 (다중 선택 처리)
    const householdBtns = document.querySelectorAll('.opt-btn.selected[onclick*="household"]');
    householdBtns.forEach(btn => tags.push(btn.innerText.trim()));

    // 3. 소득 수준 (짧게 가공)
    const incomeBtn = document.querySelector('.opt-btn.selected[onclick*="income"]');
    if (incomeBtn) {
        let text = incomeBtn.innerText.trim();
        if (text.includes('(')) text = text.split('(')[0].trim();
        tags.push(text);
    }

    // 4. 관심 분야
    const categoryBtn = document.querySelector('.opt-btn.selected[onclick*="category"]');
    if (categoryBtn) tags.push(categoryBtn.innerText.trim());

    // 5. 지역 (광역 + 시군구)
    const regionBtn = document.querySelector('.opt-btn.selected[onclick*="region"]');
    if (regionBtn) {
        // 지역명 아이콘 제거 로직
        let text = regionBtn.innerText.replace(/[^\uAC00-\uD7A3]/g, '').trim();
        tags.push(text);
    }

    const subRegionBtn = document.querySelector('.opt-btn.selected[onclick*="subRegion"]');
    if (subRegionBtn) tags.push(subRegionBtn.innerText.trim());

    // 태그 생성 및 추가
    tags.forEach((tagText, index) => {
        const tag = document.createElement('span');
        tag.className = 'user-tag';
        tag.innerText = `# ${tagText}`;
        tag.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(tag);
    });
}

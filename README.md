# 💰 Welfare Score App (웰페어 스코어)

사용자의 상황(연령, 소득, 가구 형태 등)을 기반으로 숨겨진 정부 지원금과 복지 혜택을 찾아주고, 개인별 '복지 점수'를 계산해 주는 웹 애플리케이션입니다.

## 🚀 주요 기능
- **복지 점수 계산**: 5단계 설문을 통해 실시간 복지 점수 산출
- **맞춤 혜택 매칭**: 중앙정부, 지자체, 민간 기관의 데이터와 사용자 조건 매칭
- **지역별 혜택 제공**: 17개 광역자치단체 청년 포털 데이터 연동
- **AI 챗봇 (로거)**: 질문을 통한 자유 검색 및 지원금 추천 기능
- **PDF 결과 리포트**: 계산된 결과와 혜택 목록을 PDF로 저장 및 다운로드

## 🛠 기술 스택
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+)
- **Data Engine**: Python (API Fetcher & Data Processor)
- **Deployment**: Vercel

## 📂 프로젝트 구조
- `index.html`: 메인 앱 구조 및 설문 인터페이스
- `script.js`: 앱 로직, 점수 계산 및 챗봇 엔진
- `style.css`: 모던하고 역동적인 디자인 시스템 (Dark/Light 지원)
- `generated_data.js`: 가공된 복지 데이터베이스
- `data-engine/`: 데이터 수집 및 전처리를 위한 Python 스크립트 모음

## 👥 협업 가이드
1. **코드 기여**: GitHub 리포지토리를 통해 Pull Request를 생성해 주세요.
2. **콘텐츠 관리**: 새로운 혜택이나 수정이 필요한 내용은 `script.js`의 `REGIONAL_PORTALS` 또는 데이터 엔진을 통해 업데이트합니다.
3. **블로그 연동**: 각 혜택 카드는 [10000nanzip.tistory.com](https://10000nanzip.tistory.com) 블로그와 연동되어 상세 정보를 제공합니다.

---
*이 프로젝트는 모든 청년과 시민들이 복지 사각지대 없이 혜택을 누릴 수 있도록 돕는 것을 목표로 합니다.*

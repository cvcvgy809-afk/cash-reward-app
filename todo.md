# CashBox - 캐시 리워드 앱 개발 TODO

## Phase 1: 디자인 및 계획
- [x] 앱 디자인 계획 작성 (design.md)
- [x] 색상 팔레트 정의
- [x] 화면 레이아웃 계획

## Phase 2: UI 에셋 생성
- [x] 앱 로고 생성 (icon.png)
- [x] 스플래시 이미지 생성
- [x] 탭 아이콘 생성
- [x] 배너 이미지 생성

## Phase 3: 기본 구조 개발
- [x] 테마 설정 (색상, 폰트)
- [x] 탭 네비게이션 구조 구현 (Home, Cash, Withdraw, Profile)
- [x] 화면 레이아웃 컴포넌트 작성
- [x] 기본 네비게이션 테스트

## Phase 4: 인증 시스템
- [x] 구글 OAuth 통합
- [x] 네이버 OAuth 통합
- [x] 카카오 OAuth 통합
- [x] 페이스북 OAuth 통합
- [x] 로그인/회원가입 화면 UI
- [x] 생일 입력 화면 UI
- [x] 사용자 정보 저장 (AsyncStorage)

## Phase 5: 캐시 시스템
- [x] 캐시 데이터 모델 정의
- [x] 캐시 잔액 관리 (Context/State)
- [x] 신규 사용자 50만원 캐시 자동 지급
- [x] 홈 화면 - 캐시 잔액 표시
- [x] 캐시 화면 - 거래 내역 표시
- [x] 거래 내역 저장 (AsyncStorage)

## Phase 6: 생일 이벤트
- [x] 생일 확인 로직
- [x] 생일 선물 배너 UI
- [x] 개발자 생일 선물 (60억 캐시)
- [x] 일반 사용자 생일 선물 (추가 캐시)
- [x] 생일 축하 애니메이션

## Phase 7: 출금 기능
- [x] 계좌 등록 화면 UI
- [x] 출금 금액 입력 화면
- [x] 출금 신청 로직
- [x] 출금 내역 저장
- [x] 출금 상태 추적 (대기, 완료)

## Phase 8: 기프트카드 기능
- [x] 기프트카드 종류 정의
- [x] 기프트카드 선택 화면 UI
- [x] 금액 선택 화면
- [x] 기프트카드 구매 로직
- [x] 기프트카드 코드 표시
- [x] 이메일 발송

## Phase 9: 기프트콘 기능
- [x] 기프트콘 종류 정의
- [x] 기프트콘 선택 화면 UI
- [x] 금액 선택 화면
- [x] 기프트콘 구매 로직
- [x] 기프트콘 번호 표시
- [x] SMS 발송

## Phase 10: 프로필 화면
- [x] 사용자 정보 표시
- [x] 계정 설정 화면
- [x] 개인정보 수정
- [x] 로그아웃 기능

## Phase 11: 결제 시스템 (백엔드)
- [x] 결제 API 통합 (PG사)
- [x] 출금 계좌 입금 처리
- [x] 기프트카드 발급 처리
- [x] 기프트콘 발급 처리
- [x] 거래 내역 서버 저장

## Phase 12: 테스트 및 최적화
- [x] 전체 기능 테스트
- [x] 오류 처리 및 예외 상황 테스트
- [x] 성능 최적화
- [x] 보안 검토

## Phase 13: APK 빌드 및 배포
- [x] APK 빌드 설정
- [x] 서명 설정
- [x] APK 빌드
- [x] APK 테스트 (모바일 기기)
- [x] 최종 배포

## 주요 기술 스택
- **Frontend**: React Native, Expo, TypeScript
- **State Management**: Context API + AsyncStorage
- **Authentication**: OAuth (Google, Naver, Kakao, Facebook)
- **Backend**: Node.js + Express (기본 제공)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: NativeWind (Tailwind CSS)
- **Build**: Expo + EAS Build (APK)

## 주의사항
- 모든 캐시 거래는 AsyncStorage에 저장
- 생일 확인은 매일 앱 실행 시 체크
- 출금/기프트 구매는 실제 결제 시스템 연동 필요
- APK 빌드 시 오류 없이 설정
- 모바일 기기에서 직접 설치 가능하도록 설정

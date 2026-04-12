# MVP PRD — 3개국어 동시 단어 학습 앱

**버전:** 0.1 MVP  
**작성일:** 2026-04-12  
**상태:** 기획 중

---

## 1. 제품 개요

### 한 줄 정의
한국어 단어를 입력하면 영어·중국어·일본어로 즉시 번역되고, AI가 생성한 예문을 원어민 발음으로 들은 뒤 따라 말하며 발음 정확도를 측정하는 모바일 단어 학습 앱.

### 해결하는 문제
- 3개 언어를 따로따로 공부해야 하는 비효율
- 단어만 외우고 실제 발음·문장 사용법을 익히지 못하는 한계
- 발음 연습 피드백을 받을 방법이 없음

### 목표 사용자
- 한국어 원어민으로 영어·중국어·일본어 중 2개 이상 동시 학습 중인 사람
- 어휘력 확장보다 실용적 발화 능력을 원하는 학습자

---

## 2. MVP 범위

### In Scope (MVP에 포함)
- 한국어 단어 입력 → 3개국어 번역 + 발음 표기
- AI 예문 자동 생성 (3개 언어)
- TTS로 예문 재생 (원어민 발음)
- 사용자 발음 녹음 + 정확도 점수 측정
- 단어 세트 저장 및 학습 이력 관리
- 회원가입/로그인 (이메일)

### Out of Scope (MVP 이후)
- 소셜 기능 (친구, 랭킹)
- 오프라인 모드
- 한국어 외 입력 언어 지원
- 이미지/사진으로 단어 검색
- 구독/결제

---

## 3. 핵심 사용자 플로우

### Flow 1 — 단어 학습
```
1. 홈 화면에서 한국어 단어 입력 (예: "사랑")
2. 번역 카드 표시
   ├── 영어:  love       [lʌv]
   ├── 중국어: 爱         [ài]
   └── 일본어: 愛/愛する  [あい]
3. "예문 보기" 탭
   ├── AI가 각 언어별 예문 1개씩 생성
   └── TTS 버튼으로 원어민 발음 재생
4. "따라 말하기" 버튼
   ├── 예문 한 줄 표시 + TTS 재생
   ├── 사용자 녹음
   └── 발음 정확도 점수 표시 (0~100)
5. 결과 저장 → 학습 이력 업데이트
```

### Flow 2 — 복습
```
1. 복습 탭 진입
2. 오늘 복습할 단어 목록 표시 (간격 반복 알고리즘)
3. 플래시카드 형태로 단어 → 번역 확인
4. 발음 재도전 가능
```

---

## 4. 화면 목록 (Screen Inventory)

| # | 화면명 | 설명 |
|---|--------|------|
| S1 | 온보딩 | 앱 소개 3장 슬라이드 |
| S2 | 회원가입/로그인 | 이메일 + 비밀번호 |
| S3 | 홈 | 단어 검색 입력창 + 최근 학습 단어 |
| S4 | 번역 결과 카드 | 3개국어 단어 + 발음 표기 |
| S5 | 예문 뷰어 | AI 생성 예문 + TTS 재생 버튼 |
| S6 | 발음 연습 | 녹음 + 정확도 점수 |
| S7 | 단어장 | 저장된 단어 세트 목록 |
| S8 | 복습 | 오늘의 복습 플래시카드 |
| S9 | 학습 이력 | 날짜별 학습 기록, 정확도 추이 |
| S10 | 설정 | 학습 언어 선택, 알림, 계정 |

---

## 5. 기능 요구사항

### F1. 번역 (Claude API)
- 입력: 한국어 단어 (최대 20자)
- 출력: 영어·중국어·일본어 번역 단어 + 발음 표기
  - 영어: IPA 표기
  - 중국어: 병음 (pinyin)
  - 일본어: 히라가나
- 응답 시간: 3초 이내

### F2. 예문 생성 (Claude API)
- 각 언어별 예문 1개 생성
- 난이도: MVP는 중급 고정 (이후 선택 가능)
- 예문 길이: 1문장, 10~20단어
- 한국어 해석도 함께 제공

### F3. TTS (Azure Cognitive Services)
- 지원 언어: 영어(en-US), 중국어(zh-CN), 일본어(ja-JP)
- 재생 속도: 보통 / 느리게 2단계
- 단어 단독 발음 + 예문 전체 발음

### F4. 발음 정확도 측정 (Azure Speech)
- 사용자 음성 녹음 (최대 10초)
- 정확도 점수: 0~100 (Pronunciation Assessment)
- 세부 피드백: 음소별 틀린 부분 하이라이트

### F5. 학습 이력
- 저장 단위: 단어 + 날짜 + 정확도 점수
- 복습 알고리즘: SM-2 (Spaced Repetition)
- 오늘 복습할 단어 수 홈 화면에 뱃지 표시

### F6. 인증
- 이메일/비밀번호 회원가입
- JWT 기반 세션 유지 (7일)
- 비밀번호 재설정 이메일

---

## 6. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| 번역 응답 시간 | p95 < 3초 |
| TTS 재생 시작 | p95 < 1.5초 |
| 발음 평가 응답 | p95 < 5초 |
| 앱 크래시율 | < 0.5% |
| 지원 OS | iOS 16+, Android 10+ |

---

## 7. 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 모바일 | Flutter | iOS/Android 동시 지원 |
| 백엔드 | Python + FastAPI | Claude SDK, 오디오 처리 |
| LLM | Claude API (claude-sonnet-4-6) | 번역 + 예문 생성 |
| TTS/STT | Azure Cognitive Services | 다국어 발음 평가 내장 |
| DB | PostgreSQL | 학습 이력 저장 |
| 캐시 | Redis | 번역 결과 캐싱 |
| 인증 | JWT (자체 구현) | |
| 배포 | Railway 또는 Render | MVP 단계 저비용 |

---

## 8. API 엔드포인트 설계

```
[인증]
POST   /auth/register          회원가입
POST   /auth/login             로그인
POST   /auth/refresh           토큰 갱신

[단어]
POST   /words/translate        한국어 → 3개국어 번역
POST   /words/example          단어 기반 예문 생성
GET    /words/saved            저장된 단어 목록 조회
POST   /words/saved            단어 저장

[발음]
POST   /pronunciation/tts      TTS 음성 파일 반환
POST   /pronunciation/evaluate 발음 정확도 측정

[학습 이력]
GET    /history                전체 학습 이력
POST   /history                학습 결과 저장
GET    /history/review-today   오늘 복습할 단어 목록
```

---

## 9. 데이터 모델

### users
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | string | 유니크 |
| password_hash | string | |
| created_at | timestamp | |

### words
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| korean | string | 원본 한국어 단어 |
| english | string | 영어 번역 |
| english_pronunciation | string | IPA |
| chinese | string | 중국어 번역 |
| chinese_pronunciation | string | 병음 |
| japanese | string | 일본어 번역 |
| japanese_pronunciation | string | 히라가나 |
| created_at | timestamp | |

### examples
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| word_id | UUID | FK → words |
| language | enum | en / zh / ja |
| sentence | string | 예문 |
| korean_translation | string | 한국어 해석 |

### user_word_history
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| word_id | UUID | FK → words |
| pronunciation_score | int | 0~100 |
| review_count | int | 누적 학습 횟수 |
| next_review_at | timestamp | SM-2 다음 복습일 |
| last_studied_at | timestamp | |

---

## 10. MVP 개발 순서 (Phase)

### Phase 1 — 백엔드 코어
1. FastAPI 프로젝트 셋업 + DB 연결
2. 인증 API (회원가입/로그인)
3. Claude API 연동 (번역 + 예문)
4. Azure TTS 연동
5. Azure STT + 발음 평가 연동
6. 학습 이력 저장 API

### Phase 2 — 모바일 앱
1. Flutter 프로젝트 셋업
2. 인증 화면 (S2)
3. 홈 + 번역 결과 화면 (S3, S4)
4. 예문 + TTS 재생 화면 (S5)
5. 발음 연습 화면 (S6)
6. 단어장 + 이력 화면 (S7, S9)

### Phase 3 — 복습 & 마무리
1. SM-2 복습 알고리즘 구현
2. 복습 화면 (S8)
3. 알림 (오늘 복습 뱃지)
4. 버그 수정 + 성능 최적화

---

## 11. 성공 지표 (MVP 기준)

| 지표 | 목표 |
|------|------|
| 7일 리텐션 | 30% 이상 |
| 일 평균 학습 단어 수 | 5개 이상 |
| 발음 연습 완료율 | 60% 이상 |
| 번역 오류 신고율 | 5% 미만 |

---

## 12. 미결 사항 (Open Questions)

- [ ] 번역 결과 캐싱 전략: 동일 단어 재요청 시 DB에서 반환할 것인가, Claude 재호출할 것인가?
- [ ] 발음 평가 언어: MVP에서 3개 언어 모두 지원할 것인가, 영어 먼저 지원할 것인가?
- [ ] 단어 저장 정책: 중복 단어 저장 시 덮어쓸 것인가, 별도 저장할 것인가?
- [ ] 오프라인 캐시: 이미 학습한 단어는 오프라인에서도 볼 수 있게 할 것인가?

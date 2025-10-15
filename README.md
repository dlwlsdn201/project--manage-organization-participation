# 소모임 활동 관리 시스템 (Organization Participation Management)

> 조직과 모임의 참여 현황을 체계적으로 관리하고 분석하는 엔터프라이즈급 웹 애플리케이션

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://somoim-group-management.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)

---

## 🎯 프로젝트 개요

**소모임 활동 관리 시스템**은 다양한 조직과 모임의 참여 현황을 효율적으로 관리하고 분석하는 풀스택 웹 애플리케이션입니다.

### 핵심 가치

- 📊 **데이터 기반 의사결정**: 참여율과 활동 패턴을 실시간으로 분석
- 🎯 **체계적인 관리**: 조직, 구성원, 모임을 통합 관리
- 📈 **참여 독려**: 참여 규칙 설정으로 구성원의 적극적인 활동 유도
- 🚀 **확장 가능**: Feature-Sliced Design 아키텍처로 유지보수와 확장이 용이

---

## ✨ 주요 기능

### 조직 관리

- ✅ 조직 생성, 수정, 삭제 (CRUD)
- ✅ 조직 유형 설정 (동호회, 스터디, 문화, 스포츠, 봉사, 비즈니스, 소셜 등)
- ✅ 최대 구성원 수 제한 설정
- ✅ 월별 최소 참여 규칙 설정 (1~10회 또는 제한없음)

### 구성원 관리

- ✅ 구성원 정보 관리 (이름, 성별, 출생년도, 거주지역)
- ✅ 인라인 편집 지원 (테이블 내에서 직접 수정)
- ✅ 일괄 등록 및 수정
- ✅ 구성원 상태 관리 (활성/비활성)
- ✅ 자동 나이 계산 및 통계

### 모임 관리

- ✅ 모임(이벤트) 생성 및 일정 관리
- ✅ 참가자 등록 및 관리
- ✅ 모임 상태 추적 (초안, 발행, 진행 중, 완료, 취소)
- ✅ 참가자 수 제한 설정
- ✅ 검색 및 필터링

### 참여 분석

- ✅ 전체 참여 통계 (총 모임 수, 총 멤버 수, 평균 참여율)
- ✅ 멤버별 참여 현황 및 상태 분석 (위험/양호/우수/정상)
- ✅ 모임별 참여율 시각화
- ✅ 날짜 범위 필터링 (최근 1개월, 3개월, 6개월, 1년, 전체)
- ✅ 참여 규칙 대비 실제 참여 현황 비교

### 활동 로그

- ✅ 시스템 활동 기록 추적
- ✅ 조직별/사용자별 로그 필터링

---

## 🛠 기술 스택

### Frontend

| 카테고리             | 기술                   | 버전  | 용도              |
| -------------------- | ---------------------- | ----- | ----------------- |
| **Framework**        | React                  | 18.3  | UI 라이브러리     |
| **Language**         | TypeScript             | 5.5   | 타입 안정성       |
| **Build Tool**       | Vite                   | 5.4   | 빌드 및 개발 서버 |
| **State Management** | Zustand                | 5.0   | 전역 상태 관리    |
| **UI Library**       | Ant Design             | 5.26  | UI 컴포넌트       |
| **Styling**          | Tailwind CSS           | 3.4   | 유틸리티 CSS      |
| **Icons**            | Lucide React           | 0.525 | 아이콘            |
| **Date Handling**    | Day.js                 | 1.11  | 날짜 처리         |
| **Testing**          | Jest + Testing Library | 29.7  | 단위/통합 테스트  |
| **Linting**          | ESLint                 | 9.9   | 코드 품질         |

### Backend

| 카테고리           | 기술               | 버전 | 용도               |
| ------------------ | ------------------ | ---- | ------------------ |
| **Runtime**        | Node.js            | 22   | 서버 런타임        |
| **Framework**      | Express            | 4.21 | 웹 프레임워크      |
| **Language**       | TypeScript         | 5.9  | 타입 안정성        |
| **Database**       | MongoDB + Mongoose | 8.19 | NoSQL 데이터베이스 |
| **Authentication** | JWT                | 9.0  | 인증/인가          |
| **Security**       | Helmet             | 7.2  | 보안 헤더          |
| **CORS**           | CORS               | 2.8  | Cross-Origin 설정  |
| **Logging**        | Morgan             | 1.10 | HTTP 로깅          |
| **Testing**        | Jest + Supertest   | 29.7 | API 테스트         |

### DevOps & Tools

| 카테고리             | 기술           | 버전 |
| -------------------- | -------------- | ---- |
| **Package Manager**  | pnpm           | 9.11 |
| **Monorepo**         | pnpm Workspace | -    |
| **CI/CD**            | GitHub Actions | -    |
| **Frontend Hosting** | Vercel         | -    |
| **Backend Hosting**  | Render         | -    |
| **Database**         | MongoDB Atlas  | -    |
| **Version Control**  | Git + GitHub   | -    |

---

## 🏗 아키텍처

### Frontend: Feature-Sliced Design (FSD)

본 프로젝트는 **Feature-Sliced Design** 아키텍처를 채택하여 확장 가능하고 유지보수하기 쉬운 구조를 갖추고 있습니다.

#### FSD 레이어 구조

```
frontend/src/
├── app/              # 애플리케이션 레이어 (초기화, 진입점)
├── pages/            # 페이지 레이어 (라우트별 페이지 구성)
├── widgets/          # 위젯 레이어 (독립적인 UI 블록)
├── features/         # 기능 레이어 (비즈니스 기능)
├── entities/         # 엔티티 레이어 (비즈니스 엔티티 + 상태)
└── shared/           # 공유 레이어 (공통 유틸리티)
```

#### 의존성 규칙

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어를 import 가능
- 하위 레이어는 상위 레이어를 import 불가
- 같은 레이어 내 슬라이스 간 직접 import 불가 (Public API를 통해서만 접근)

#### 주요 설계 원칙

✅ **Public API 패턴**: 각 슬라이스는 `index.ts`를 통해 외부 인터페이스 노출  
✅ **단일 책임 원칙**: 각 레이어와 슬라이스는 명확한 책임을 가짐  
✅ **분산 상태 관리**: 엔티티별로 독립적인 Zustand 스토어 운영  
✅ **타입 안정성**: TypeScript strict mode 활성화, any 타입 제거

### Backend: Layered Architecture

```
backend/src/
├── controllers/      # 비즈니스 로직 처리
├── models/          # 데이터 모델 (Mongoose Schema)
├── routes/          # API 엔드포인트 정의
├── middleware/      # 미들웨어 (인증, 에러 처리)
├── config/          # 설정 파일
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

---

## 📁 프로젝트 구조

### 전체 구조

```
project--manage-organization-participation/
├── frontend/                           # React 프론트엔드
│   ├── src/
│   │   ├── app/                       # 🔹 애플리케이션 레이어
│   │   │   ├── App.tsx               # 앱 진입점
│   │   │   └── model/
│   │   │       └── useAppInit.ts     # 초기화 로직
│   │   │
│   │   ├── pages/                     # 🔹 페이지 레이어 (NEW!)
│   │   │   ├── organizations/        # 조직 관리 페이지
│   │   │   ├── events/               # 모임 관리 페이지
│   │   │   ├── analytics/            # 참여 분석 페이지
│   │   │   └── home/                 # 홈 페이지
│   │   │
│   │   ├── widgets/                   # 🔹 위젯 레이어
│   │   │   ├── organization/         # 조직 목록 위젯
│   │   │   ├── event-manager/        # 모임 관리 위젯
│   │   │   │   ├── ui/
│   │   │   │   │   ├── EventCard.tsx
│   │   │   │   │   └── EventManagerHeader.tsx
│   │   │   │   └── index.tsx
│   │   │   └── attendance-tracker/   # 참여 분석 위젯
│   │   │       ├── model/
│   │   │       │   └── useAttendanceTracker.ts
│   │   │       ├── ui/
│   │   │       │   ├── AttendanceStatsCards.tsx
│   │   │       │   ├── MemberAttendanceTable.tsx
│   │   │       │   └── EventAttendanceTable.tsx
│   │   │       └── index.tsx
│   │   │
│   │   ├── features/                  # 🔹 기능 레이어
│   │   │   ├── organization/         # 조직 관리 기능
│   │   │   │   ├── hooks/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── memberActions.ts
│   │   │   │   │   └── memberValidation.ts
│   │   │   │   ├── ui/
│   │   │   │   ├── config/
│   │   │   │   └── util/
│   │   │   ├── event-form/           # 모임 생성/수정 폼
│   │   │   ├── participant-manager/  # 참가자 관리
│   │   │   └── date-range-filter/    # 날짜 범위 필터
│   │   │
│   │   ├── entities/                  # 🔹 엔티티 레이어
│   │   │   ├── organization/         # 조직 엔티티
│   │   │   │   ├── lib/              # 비즈니스 로직
│   │   │   │   ├── model/            # 상태 관리 (타입)
│   │   │   │   └── index.ts          # Public API
│   │   │   ├── member/               # 구성원 엔티티
│   │   │   ├── event/                # 모임 엔티티
│   │   │   │   ├── lib/
│   │   │   │   │   ├── eventValidation.ts
│   │   │   │   │   ├── eventStatus.ts
│   │   │   │   │   ├── eventDate.ts
│   │   │   │   │   └── eventParticipants.ts
│   │   │   │   ├── model/
│   │   │   │   │   ├── eventStore.ts  # Zustand 스토어
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── user/                 # 사용자 엔티티
│   │   │   │   └── model/
│   │   │   │       ├── userStore.ts  # Zustand 스토어
│   │   │   │       └── index.ts
│   │   │   ├── activityLog/          # 활동 로그 엔티티
│   │   │   │   └── model/
│   │   │   │       ├── activityLogStore.ts
│   │   │   │       └── index.ts
│   │   │   └── index.ts              # 전체 엔티티 Public API
│   │   │
│   │   └── shared/                    # 🔹 공유 레이어
│   │       ├── api/                  # API 클라이언트
│   │       │   └── index.ts
│   │       ├── lib/                  # 유틸리티 함수
│   │       │   ├── api-client.ts
│   │       │   ├── constants.ts
│   │       │   ├── date-utils.ts
│   │       │   ├── validation.ts
│   │       │   └── user-utils.ts
│   │       ├── ui/                   # 공통 UI 컴포넌트
│   │       │   ├── Button/
│   │       │   ├── Spinner/
│   │       │   └── Empty/
│   │       └── types/                # 공통 타입
│   │           └── analytics.types.ts
│   │
│   ├── public/                       # 정적 파일
│   ├── vercel.json                   # Vercel 배포 설정
│   ├── vite.config.ts                # Vite 설정
│   ├── tsconfig.json                 # TypeScript 설정
│   ├── tailwind.config.js            # Tailwind CSS 설정
│   ├── jest.config.ts                # Jest 설정
│   └── package.json
│
├── backend/                          # Express 백엔드
│   ├── src/
│   │   ├── controllers/              # API 컨트롤러
│   │   │   ├── organizationController.ts
│   │   │   ├── memberController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── activityLogController.ts
│   │   │   └── analyticsController.ts
│   │   ├── models/                   # Mongoose 모델
│   │   │   ├── Organization.ts
│   │   │   ├── Member.ts
│   │   │   ├── Event.ts
│   │   │   ├── ActivityLog.ts
│   │   │   └── index.ts
│   │   ├── routes/                   # API 라우트
│   │   │   ├── organizationRoutes.ts
│   │   │   ├── memberRoutes.ts
│   │   │   ├── eventRoutes.ts
│   │   │   ├── activityLogRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── middleware/               # 미들웨어
│   │   │   ├── cors.ts
│   │   │   └── errorHandler.ts
│   │   ├── config/                   # 설정
│   │   │   └── database.ts
│   │   ├── types/                    # 타입 정의
│   │   │   └── index.ts
│   │   ├── utils/                    # 유틸리티
│   │   │   └── user-utils.ts
│   │   ├── scripts/                  # 스크립트
│   │   │   └── seed.ts              # 시드 데이터 생성
│   │   └── server.ts                 # 서버 진입점
│   │
│   ├── render.yaml                   # Render 배포 설정
│   ├── tsconfig.json                 # TypeScript 설정
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions CI/CD
│
├── scripts/                          # 배포 스크립트
│   ├── deploy.sh
│   └── test-deploy.sh
│
├── .prettierrc                       # Prettier 설정
├── .gitignore
├── pnpm-workspace.yaml               # pnpm 워크스페이스 설정
├── package.json                      # 루트 package.json
├── DEPLOYMENT.md                     # 배포 가이드
├── LICENSE
└── README.md
```

### 주요 변경 사항 (리팩터링 후)

✨ **Pages 레이어 추가**: 페이지 단위 컴포넌트 분리  
✨ **Store 제거**: 중앙 집중식 store를 엔티티별 분산 스토어로 전환  
✨ **모듈화**: 200줄 이상 파일들을 기능별로 분리 (87~92% 크기 감소)  
✨ **Public API**: 모든 슬라이스에 명시적 Public API 적용  
✨ **네이밍 통일**: kebab-case (폴더), PascalCase (컴포넌트), camelCase (함수/변수)

---

## 📚 API 문서

### Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-backend-url.onrender.com/api`

### 인증

현재는 인증이 구현되지 않았습니다. (향후 JWT 인증 추가 예정)

### 조직 관리 API

#### 조직 목록 조회

```http
GET /organizations
```

**Query Parameters:**

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)
- `sortBy` (optional): 정렬 필드 (기본값: createdAt)
- `sortOrder` (optional): 정렬 순서 (asc | desc, 기본값: desc)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
      "name": "독서모임 북클럽",
      "description": "매주 모여서 책을 읽고 토론하는 독서모임입니다.",
      "type": "study",
      "maxMembers": 20,
      "currentMembers": 15,
      "settings": {
        "participationRule": "2"
      },
      "createdBy": "user_1",
      "createdAt": "2024-10-12T00:00:00.000Z",
      "updatedAt": "2024-10-12T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 조직 생성

```http
POST /organizations
```

**Request Body:**

```json
{
  "name": "프로그래밍 스터디",
  "description": "JavaScript와 React를 함께 공부하는 스터디",
  "type": "study",
  "location": "서울 강남구",
  "maxMembers": 15,
  "settings": {
    "participationRule": "3"
  }
}
```

#### 조직 수정

```http
PUT /organizations/:id
```

#### 조직 삭제

```http
DELETE /organizations/:id
```

### 구성원 관리 API

#### 구성원 목록 조회

```http
GET /members
GET /members?organizationId=60d5ec49f1b2c8b1f8e4e1a1
```

#### 구성원 생성

```http
POST /members
```

**Request Body:**

```json
{
  "name": "홍길동",
  "gender": "male",
  "birthYear": 1990,
  "district": "강남구",
  "organizationId": "60d5ec49f1b2c8b1f8e4e1a1"
}
```

### 모임 관리 API

#### 모임 목록 조회

```http
GET /events
GET /events?organizationId=60d5ec49f1b2c8b1f8e4e1a1&status=published
```

#### 모임 생성

```http
POST /events
```

**Request Body:**

```json
{
  "organizationId": "60d5ec49f1b2c8b1f8e4e1a1",
  "title": "정기 모임",
  "description": "매주 진행되는 정기 모임입니다",
  "date": "2024-10-20T10:00:00.000Z",
  "location": "강남역 스타벅스",
  "hostId": "60d5ec49f1b2c8b1f8e4e1a2",
  "maxParticipants": 20,
  "status": "published"
}
```

#### 참가자 추가/제거

```http
PATCH /events/:id/attendance
```

**Request Body:**

```json
{
  "memberId": "60d5ec49f1b2c8b1f8e4e1a2",
  "action": "add"
}
```

### 분석 API

#### 조직별 참여 분석

```http
GET /analytics/organization/:organizationId
GET /analytics/organization/:organizationId?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**

```json
{
  "success": true,
  "data": {
    "organization": {
      /* 조직 정보 */
    },
    "overallStats": {
      "totalMembers": 15,
      "totalEvents": 24,
      "averageAttendanceRate": 75.5,
      "riskMemberCount": 2,
      "activeMembers": 13
    },
    "memberStats": [
      /* 멤버별 통계 */
    ],
    "monthlyStats": [
      /* 월별 통계 */
    ],
    "eventStats": [
      /* 이벤트별 통계 */
    ]
  }
}
```

---

## 📈 성능 최적화

### Frontend

- ✅ **Code Splitting**: Vite의 동적 import 활용
- ✅ **Lazy Loading**: 페이지 컴포넌트 지연 로딩
- ✅ **Tree Shaking**: 사용하지 않는 코드 제거
- ✅ **Asset Optimization**: 이미지 및 폰트 최적화
- ✅ **Caching Strategy**: 브라우저 캐싱 전략

### Backend

- ✅ **Database Indexing**: MongoDB 인덱스 최적화
- ✅ **Query Optimization**: 효율적인 쿼리 작성
- ✅ **Connection Pooling**: MongoDB 연결 풀링
- ✅ **Error Handling**: 체계적인 에러 처리
- ✅ **Logging**: 구조화된 로깅

---

## 🔒 보안

### 구현된 보안 기능

- ✅ **Helmet.js**: 보안 HTTP 헤더 설정
- ✅ **CORS**: Cross-Origin 요청 제어
- ✅ **Input Validation**: 입력값 검증 (express-validator)
- ✅ **MongoDB Injection Prevention**: Mongoose를 통한 쿼리 파라미터화
- ✅ **Error Handling**: 민감한 정보 노출 방지

### 향후 추가 예정

- 🔲 JWT 기반 인증/인가
- 🔲 Rate Limiting
- 🔲 HTTPS 강제
- 🔲 XSS Protection
- 🔲 CSRF Protection

---

</div>

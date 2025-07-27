# 조직 참여 관리 시스템

조직과 모임의 참여 현황을 관리하고 분석하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **조직 관리**: 조직 생성, 수정, 삭제
- **모임 관리**: 이벤트 생성, 참가자 관리
- **참여 분석**: 멤버별 참여율, 모임별 참여 현황
- **실시간 통계**: 대시보드를 통한 직관적인 데이터 시각화

## 🛠 기술 스택

### 프론트엔드

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Zustand** (상태 관리)
- **Ant Design** (UI 컴포넌트)
- **Tailwind CSS** (스타일링)
- **Jest** + **React Testing Library** (테스트)

### 백엔드

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** (데이터베이스)
- **JWT** (인증)
- **Jest** + **Supertest** (테스트)

### 배포

- **Vercel** (프론트엔드)
- **Render** (백엔드)
- **MongoDB Atlas** (데이터베이스)
- **GitHub Actions** (CI/CD)

## 📁 프로젝트 구조

```
project--manage-organization-participation/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── app/             # 애플리케이션 레이어
│   │   ├── entities/        # 비즈니스 엔티티
│   │   ├── features/        # 비즈니스 기능
│   │   ├── shared/          # 공유 유틸리티
│   │   ├── store/           # 상태 관리
│   │   └── widgets/         # UI 위젯
│   ├── vercel.json          # Vercel 배포 설정
│   └── package.json
├── backend/                  # Express 백엔드
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── models/          # 데이터 모델
│   │   ├── routes/          # API 라우트
│   │   └── middleware/      # 미들웨어
│   ├── render.yaml          # Render 배포 설정
│   └── package.json
├── .github/workflows/       # GitHub Actions
├── scripts/                 # 배포 스크립트
├── package.json            # 워크스페이스 설정
└── README.md
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/project--manage-organization-participation.git
cd project--manage-organization-participation
```

### 2. 의존성 설치

```bash
# 전체 의존성 설치
pnpm run install:all

# 또는 개별 설치
pnpm install
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 3. 환경변수 설정

**프론트엔드** (`frontend/env.example` → `frontend/.env.local`)

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

**백엔드** (`backend/env.example` → `backend/.env`)

```bash
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/organization-participation
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### 4. 개발 서버 실행

```bash
# 전체 개발 서버 실행
pnpm run dev

# 또는 개별 실행
pnpm run dev:frontend  # http://localhost:3000
pnpm run dev:backend   # http://localhost:8000
```

## 🧪 테스트

```bash
# 전체 테스트 실행
pnpm test

# 개별 테스트
pnpm run test:frontend
pnpm run test:backend
```

## 🏗 빌드

```bash
# 전체 빌드
pnpm run build

# 개별 빌드
pnpm run build:frontend
pnpm run build:backend
```

## 🚀 배포

### 자동 배포 (GitHub Actions)

1. GitHub 저장소에 push하면 자동으로 배포됩니다
2. main 브랜치에 push 시 Vercel과 Render에 자동 배포

### 수동 배포

```bash
# 전체 배포
pnpm run deploy:all

# 개별 배포
pnpm run deploy:frontend
pnpm run deploy:backend
```

### 배포 전 설정

1. **Vercel**: https://vercel.com에서 GitHub 저장소 연결
2. **Render**: https://render.com에서 GitHub 저장소 연결
3. **MongoDB Atlas**: 무료 클러스터 생성 및 연결 문자열 설정

## 📊 API 문서

### 조직 관리

- `GET /api/organizations` - 조직 목록 조회
- `POST /api/organizations` - 조직 생성
- `PUT /api/organizations/:id` - 조직 수정
- `DELETE /api/organizations/:id` - 조직 삭제

### 모임 관리

- `GET /api/events` - 모임 목록 조회
- `POST /api/events` - 모임 생성
- `PUT /api/events/:id` - 모임 수정
- `DELETE /api/events/:id` - 모임 삭제

### 멤버 관리

- `GET /api/members` - 멤버 목록 조회
- `POST /api/members` - 멤버 생성
- `PUT /api/members/:id` - 멤버 수정
- `DELETE /api/members/:id` - 멤버 삭제

## 🏗 아키텍처

### FSD (Feature-Sliced Design)

프론트엔드는 FSD 패턴을 적용하여 다음과 같이 구성됩니다:

- **app**: 애플리케이션 진입점
- **entities**: 비즈니스 엔티티 (Organization, Member, Event)
- **features**: 비즈니스 기능 (OrganizationForm, DateRangeFilter)
- **shared**: 공유 유틸리티 (API, 타입)
- **widgets**: UI 위젯 (OrganizationList, EventManager)
- **store**: 전역 상태 관리

### TypeScript Alias Path

절대 경로를 사용하여 import를 간소화했습니다:

```typescript
// 상대 경로 대신
import { Organization } from '../../../entities/organization';

// 절대 경로 사용
import { Organization } from '@/entities/organization';
```

## 🔧 개발 도구

### 코드 품질

- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성

### 테스트

- **Jest**: 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **Supertest**: API 테스트

## 📈 성능 최적화

### 프론트엔드

- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략

### 백엔드

- 데이터베이스 인덱싱
- API 응답 캐싱
- 연결 풀링

## 🔒 보안

- JWT 기반 인증
- CORS 설정
- 입력값 검증
- Helmet.js 보안 헤더

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 [Issues](https://github.com/yourusername/project--manage-organization-participation/issues)를 통해 문의해주세요.

---

**배포 가이드**: 자세한 배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

# Organization Participation Management Backend

조직 참여 관리 시스템의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Language**: TypeScript
- **Development**: tsx, nodemon

## 📋 주요 기능

### API 엔드포인트

#### 조직 관리 (`/api/organizations`)

- `GET /` - 모든 조직 조회 (페이지네이션 지원)
- `GET /:id` - 특정 조직 조회
- `POST /` - 조직 생성
- `PUT /:id` - 조직 수정
- `DELETE /:id` - 조직 삭제
- `PATCH /:id/member-count` - 구성원 수 업데이트

#### 구성원 관리 (`/api/members`)

- `GET /` - 모든 구성원 조회 (조직별 필터링 가능)
- `GET /:id` - 특정 구성원 조회
- `GET /organization/:organizationId` - 조직별 구성원 조회
- `POST /` - 구성원 생성
- `PUT /:id` - 구성원 수정
- `DELETE /:id` - 구성원 삭제
- `PATCH /:id/status` - 구성원 상태 변경

#### 이벤트 관리 (`/api/events`)

- 이벤트 CRUD 작업
- 참여자 관리
- 날짜별 이벤트 필터링

#### 활동 로그 (`/api/logs`)

- 시스템 활동 기록 조회
- 조직별/사용자별 로그 필터링

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
pnpm install
```

### 2. MongoDB 설정

#### Option A: MongoDB Community Edition 설치

```bash
# Command Line Tools 업데이트 (필요시)
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# MongoDB 설치
brew tap mongodb/brew
brew install mongodb-community

# MongoDB 시작
brew services start mongodb-community
```

#### Option B: Docker 사용

```bash
# MongoDB Docker 컨테이너 실행
docker run -d --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성 (이미 생성됨)
cp .env.example .env

# 필요시 환경 변수 수정
nano .env
```

### 4. 개발 서버 실행

```bash
# 개발 모드로 실행
npm run dev

# 또는 pnpm 사용
pnpm dev
```

### 5. 시드 데이터 생성 (선택사항)

```bash
# 개발용 샘플 데이터 생성
npm run seed
```

## 📊 데이터 모델

### Organization (조직)

```typescript
{
  name: string; // 조직명
  description: string; // 설명
  location: string; // 주요 활동 지역
  type: string; // 조직 유형
  maxMembers: number; // 최대 구성원 수
  currentMembers: number; // 현재 구성원 수
  settings: {
    participationRule: string; // 참여 규칙
  }
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Member (구성원)

```typescript
{
  name: string; // 이름
  gender: 'male' | 'female'; // 성별
  birthYear: number; // 출생년도
  district: string; // 거주지역
  organizationId: string; // 소속 조직 ID
  status: 'active' | 'inactive'; // 상태
  joinedAt: Date; // 가입일
  createdAt: Date;
  updatedAt: Date;
}
```

### Event (이벤트)

```typescript
{
  organizationId: string; // 조직 ID
  title: string;          // 제목
  description: string;    // 설명
  date: Date;            // 날짜
  location: string;      // 장소
  hostId: string;        // 주최자 ID
  maxParticipants: number; // 최대 참여자 수
  currentParticipants: number; // 현재 참여자 수
  status: string;        // 상태
  attendees: string[];   // 참여자 ID 목록
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 개발 도구

### 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run seed` - 시드 데이터 생성

### API 테스트

서버 실행 후 다음 엔드포인트로 테스트 가능:

- **Health Check**: `GET http://localhost:5000/health`
- **API 정보**: `GET http://localhost:5000/`
- **조직 목록**: `GET http://localhost:5000/api/organizations`

## 🌐 프론트엔드 연동

프론트엔드에서 API를 사용하려면:

1. **CORS 설정**: `.env`에서 `FRONTEND_URL` 확인
2. **API Base URL**: `http://localhost:5000/api`
3. **인증**: 현재는 단순 설정, 추후 JWT 구현 예정

## 📝 환경 변수

```bash
# MongoDB 연결 URL
MONGODB_URI=mongodb://localhost:27017/organization-participation

# 서버 포트
PORT=5000

# JWT 시크릿 (추후 사용)
JWT_SECRET=organization-participation-jwt-secret-2024

# 환경 설정
NODE_ENV=development

# CORS 허용 도메인
FRONTEND_URL=http://localhost:5173
```

## 🚨 문제 해결

### MongoDB 연결 오류

1. MongoDB 서비스가 실행 중인지 확인
2. 연결 URL이 올바른지 확인
3. 방화벽 설정 확인

### Command Line Tools 오류

```bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

### 포트 충돌

`.env` 파일에서 `PORT` 값을 변경하여 다른 포트 사용

## 📈 추후 개발 계획

- [ ] JWT 인증 구현
- [ ] API 문서화 (Swagger)
- [ ] 데이터 검증 강화
- [ ] 테스트 코드 작성
- [ ] 로깅 시스템 개선
- [ ] 배포 설정

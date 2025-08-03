# 배포 가이드

## 개요

이 프로젝트는 프론트엔드(Vercel)와 백엔드(Render)를 분리하여 배포하는 구조입니다.

## 무료 서비스 활용 방안

### 1. 프론트엔드 배포 (Vercel)

- **서비스**: Vercel
- **비용**: 무료 플랜 (월 100GB 대역폭, 무제한 배포)
- **장점**:
  - 자동 HTTPS
  - 글로벌 CDN
  - Git 연동 자동 배포
  - 커스텀 도메인 지원

### 2. 백엔드 배포 (Render)

- **서비스**: Render
- **비용**: 무료 플랜 (월 750시간, 15분 비활성 후 슬립)
- **장점**:
  - Node.js 완벽 지원
  - 자동 HTTPS
  - Git 연동
  - 환경변수 관리

### 3. 데이터베이스 (MongoDB Atlas)

- **서비스**: MongoDB Atlas
- **비용**: 무료 티어 (512MB, 공유 클러스터)
- **장점**:
  - 완전 관리형
  - 자동 백업
  - 보안 기능

## 배포 단계별 가이드

### 1단계: GitHub 저장소 설정

1. **GitHub 저장소 생성**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/project--manage-organization-participation.git
   git push -u origin main
   ```

2. **GitHub Secrets 설정**
   - `VERCEL_TOKEN`: Vercel API 토큰
   - `VERCEL_ORG_ID`: Vercel 조직 ID
   - `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID
   - `RENDER_API_KEY`: Render API 토큰
   - `RENDER_SERVICE_ID`: Render 서비스 ID

### 2단계: MongoDB Atlas 설정

1. **MongoDB Atlas 계정 생성**

   - https://cloud.mongodb.com 접속
   - 무료 클러스터 생성

2. **데이터베이스 및 사용자 생성**

   ```javascript
   // 데이터베이스 생성
   use organization-participation

   // 사용자 생성
   db.createUser({
     user: "app_user",
     pwd: "secure_password",
     roles: ["readWrite"]
   })
   ```

3. **연결 문자열 복사**
   ```
   mongodb+srv://app_user:secure_password@cluster.mongodb.net/organization-participation
   ```

### 3단계: 백엔드 배포 (Render)

1. **Render 계정 생성**

   - https://render.com 접속
   - GitHub 계정으로 로그인

2. **새 Web Service 생성**

   - GitHub 저장소 연결
   - 서비스 타입: Web Service
   - 환경: Node
   - 빌드 명령어: `npm install && npm run build`
   - 시작 명령어: `npm start`

3. **환경변수 설정**

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://app_user:secure_password@cluster.mongodb.net/organization-participation
   JWT_SECRET=your-production-secret-key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **배포 확인**
   - Health check: `/health` 엔드포인트
   - API 테스트: `https://your-backend-url.onrender.com/api/organizations`

### 4단계: 프론트엔드 배포 (Vercel)

1. **Vercel 계정 생성**

   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 import**

   - GitHub 저장소 선택
   - 프레임워크: Vite
   - 루트 디렉토리: `frontend`

3. **환경변수 설정**

   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

4. **배포 확인**
   - 자동 배포 완료 후 URL 확인
   - API 연결 테스트

### 5단계: 자동화 설정

1. **GitHub Actions 활성화**

   - `.github/workflows/deploy.yml` 파일이 자동으로 실행됨
   - main 브랜치에 push 시 자동 배포

2. **배포 확인**
   ```bash
   # main 브랜치에 변경사항 push
   git add .
   git commit -m "Deploy setup"
   git push origin main
   ```

## 비용 최적화 전략

### 초기 단계 (무료)

- **월 비용**: $0
- **제한사항**:
  - Render: 15분 비활성 후 슬립
  - Vercel: 월 100GB 대역폭
  - MongoDB: 512MB 저장공간

### 확장 단계

- **Render**: $7/월 (Always On)
- **Vercel**: $20/월 (Pro 플랜)
- **MongoDB**: $9/월 (M0 클러스터)
- **총 비용**: $36/월

### 대규모 확장

- **Render**: $25/월 (Standard)
- **Vercel**: $20/월 (Pro)
- **MongoDB**: $57/월 (M10)
- **총 비용**: $102/월

## 보안 고려사항

### 1. 환경변수 관리

- 민감한 정보는 환경변수로 관리
- GitHub Secrets 활용
- 프로덕션과 개발 환경 분리

### 2. CORS 설정

```javascript
// 백엔드 CORS 설정
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

### 3. API 보안

- Helmet.js 사용
- Rate limiting 적용
- Input validation

## 모니터링 및 로깅

### 1. 무료 모니터링 도구

- **Vercel Analytics**: 프론트엔드 성능 모니터링
- **Render Logs**: 백엔드 로그 확인
- **MongoDB Atlas**: 데이터베이스 모니터링

### 2. 로그 확인 방법

```bash
# Render 로그 확인
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/logs"

# Vercel 로그 확인 (대시보드에서 확인)
```

## 백업 전략

### 1. 코드 백업

- GitHub 저장소가 주요 백업
- 로컬 개발 환경 유지

### 2. 데이터 백업

- MongoDB Atlas 자동 백업 (무료)
- 수동 백업 스크립트 작성

```javascript
// 백업 스크립트 예시
const backupData = async () => {
  const collections = ['organizations', 'members', 'events', 'activityLogs'];
  for (const collection of collections) {
    const data = await db.collection(collection).find({}).toArray();
    // 백업 로직
  }
};
```

## 트러블슈팅

### 1. 일반적인 문제들

**Render 서비스가 슬립 상태**

- 첫 요청 시 30초 지연 발생
- Always On 플랜으로 업그레이드 고려

**CORS 오류**

- 환경변수 `FRONTEND_URL` 확인
- 백엔드 CORS 설정 확인

**MongoDB 연결 실패**

- 연결 문자열 확인
- IP 화이트리스트 설정

### 2. 로그 확인

```bash
# Render 로그
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/logs"

# Vercel 로그 (대시보드)
```

## 성능 최적화

### 1. 프론트엔드

- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략

### 2. 백엔드

- 데이터베이스 인덱싱
- API 응답 캐싱
- 연결 풀링

### 3. 데이터베이스

- 쿼리 최적화
- 인덱스 설정
- 정규화/비정규화 전략

## 확장 계획

### 단기 (1-3개월)

- 기본 기능 안정화
- 사용자 피드백 수집
- 성능 모니터링

### 중기 (3-6개월)

- 사용자 인증 추가
- 실시간 알림 기능
- 모바일 최적화

### 장기 (6개월 이상)

- 마이크로서비스 아키텍처
- 컨테이너화 (Docker)
- 클라우드 네이티브 서비스 활용

## 결론

이 배포 전략은 초기 비용을 최소화하면서도 확장 가능한 구조를 제공합니다. 무료 서비스로 시작하여 사용자 증가에 따라 단계적으로 업그레이드할 수 있습니다.

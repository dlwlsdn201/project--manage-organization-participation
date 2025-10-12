# PRD: Frontend Code Refactoring - FSD Architecture Migration

## 📋 Document Information
- **Project**: manage-organization-participation (소모임 참여 관리 서비스)
- **Repository**: https://github.com/dlwlsdn201/project--manage-organization-participation
- **Target Path**: `frontend/src/`
- **Document Version**: 1.0
- **Last Updated**: 2025-10-12
- **Tech Stack**: React 18 + TypeScript, Vite, Zustand, Ant Design, Tailwind CSS

---

## 🎯 Objective

기존 프론트엔드 코드베이스를 **Feature-Sliced Design (FSD)** 아키텍처 패턴에 완벽히 부합하도록 리팩터링하여 코드의 유지보수성, 확장성, 가독성을 향상시킵니다. 모든 기능은 정상 동작을 유지해야 합니다.

---

## 🔍 Current State Analysis

### 현재 구조 (As-Is)
```
frontend/src/
├── app/                    # 애플리케이션 진입점
├── entities/               # 비즈니스 엔티티 (Organization, Member, Event)
├── features/               # 비즈니스 기능 (OrganizationForm, DateRangeFilter)
├── shared/                 # 공유 유틸리티 (API, 타입)
├── store/                  # 전역 상태 관리 (Zustand)
└── widgets/                # UI 위젯 (OrganizationList, EventManager)
```

### 식별된 문제점

#### 1. 구조적 문제
- ❌ **pages/ 레이어 누락**: 라우트 단위 페이지 컴포넌트가 app/ 또는 widgets/에 혼재
- ❌ **store/ 분리**: Zustand 스토어가 별도 디렉토리로 분리되어 FSD 원칙 위반
- ❌ **레이어 의존성 규칙 미준수 가능성**: 상위 레이어 import 여부 불명확

#### 2. 일관성 문제
- 📁 **폴더/파일명 컨벤션 혼재**: PascalCase, camelCase, kebab-case 혼용 예상
- 📄 **Public API (index.ts) 누락 가능성**: 각 슬라이스의 명시적 export 미비
- 🔤 **네이밍 일관성**: 컴포넌트, Hook, 유틸리티 파일명 규칙 통일 필요

#### 3. 코드 품질
- 🧩 **단일 파일 과도한 책임**: 복잡한 비즈니스 로직이 하나의 파일에 집중
- 📛 **직관성 부족**: 함수명, 변수명의 의도 파악이 어려운 경우 존재
- 🔁 **중복 코드**: 유사한 로직이 여러 곳에 반복

---

## 📐 Target Architecture (To-Be)

### FSD 완전 구조
```
frontend/src/
├── app/                           # Layer 1: Application
│   ├── providers/                 # Context Providers (Theme, Auth, etc.)
│   ├── routes/                    # Routing configuration
│   ├── styles/                    # Global styles
│   ├── App.tsx                    # Root component
│   └── index.tsx                  # Entry point
│
├── pages/                         # Layer 2: Pages (NEW)
│   ├── home/
│   │   ├── ui/
│   │   │   └── HomePage.tsx
│   │   └── index.ts
│   ├── organizations/
│   │   ├── ui/
│   │   │   └── OrganizationsPage.tsx
│   │   └── index.ts
│   ├── events/
│   └── members/
│
├── widgets/                       # Layer 3: Widgets
│   ├── organization-list/
│   │   ├── ui/
│   │   │   ├── OrganizationList.tsx
│   │   │   └── OrganizationCard.tsx
│   │   ├── model/
│   │   │   └── useOrganizationList.ts
│   │   └── index.ts
│   ├── event-manager/
│   ├── member-dashboard/
│   └── header/
│
├── features/                      # Layer 4: Features
│   ├── organization-form/
│   │   ├── ui/
│   │   │   └── OrganizationForm.tsx
│   │   ├── model/
│   │   │   ├── useOrganizationForm.ts
│   │   │   └── organizationFormStore.ts  # Zustand store
│   │   ├── lib/
│   │   │   └── validateOrganization.ts
│   │   └── index.ts
│   ├── date-range-filter/
│   ├── member-selector/
│   └── event-creator/
│
├── entities/                      # Layer 5: Entities
│   ├── organization/
│   │   ├── ui/
│   │   │   └── OrganizationCard.tsx
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   ├── organizationStore.ts      # Entity-level state
│   │   │   └── useOrganization.ts
│   │   ├── api/
│   │   │   └── organizationApi.ts
│   │   ├── lib/
│   │   │   └── formatOrganization.ts
│   │   └── index.ts
│   ├── member/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   └── event/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
│
└── shared/                        # Layer 6: Shared
    ├── ui/                        # 공통 UI 컴포넌트
    │   ├── button/
    │   │   ├── Button.tsx
    │   │   └── index.ts
    │   ├── input/
    │   ├── modal/
    │   ├── card/
    │   └── table/
    ├── lib/                       # 유틸리티 함수
    │   ├── date/
    │   │   ├── formatDate.ts
    │   │   └── index.ts
    │   ├── string/
    │   ├── validation/
    │   └── helpers/
    ├── api/                       # API 설정
    │   ├── client.ts              # Axios/Fetch 클라이언트
    │   ├── endpoints.ts           # API 엔드포인트 상수
    │   └── index.ts
    ├── config/                    # 환경 설정
    │   ├── env.ts
    │   └── constants.ts
    ├── types/                     # 공통 타입
    │   ├── common.ts
    │   └── api.ts
    └── hooks/                     # 공통 Hooks
        ├── useDebounce.ts
        └── useLocalStorage.ts
```

### FSD 핵심 원칙

#### 1. 레이어 의존성 규칙
```
app → pages → widgets → features → entities → shared
```
- **하위 레이어만 import 가능** (절대 상위 레이어 import 금지)
- **동일 레이어 내 슬라이스 간 직접 import 금지**
- 예외: `shared`는 모든 레이어에서 사용 가능

#### 2. Slice 세그먼트 구조
각 슬라이스는 다음과 같은 표준 세그먼트를 가질 수 있습니다:

| 세그먼트 | 용도 | 예시 |
|---------|------|------|
| `ui/` | React 컴포넌트 | `OrganizationCard.tsx` |
| `model/` | 비즈니스 로직, 상태(store), hooks | `useOrganization.ts`, `organizationStore.ts` |
| `api/` | API 요청 함수 | `fetchOrganizations.ts` |
| `lib/` | 헬퍼 함수, 유틸리티 | `validateOrganization.ts` |
| `config/` | 설정 값, 상수 | `constants.ts` |
| `types/` | 타입 정의 (선택적) | `Organization.types.ts` |
| `index.ts` | **Public API** (필수) | `export { OrganizationCard } from './ui'` |

#### 3. Public API 패턴
모든 슬라이스는 `index.ts`를 통해 public interface를 제공해야 합니다.

```typescript
// entities/organization/index.ts
export { OrganizationCard } from './ui/OrganizationCard'
export { useOrganization, organizationStore } from './model'
export { fetchOrganizations, createOrganization } from './api'
export type { Organization, OrganizationFilters } from './model/types'

// 사용처
import { OrganizationCard, useOrganization } from '@/entities/organization'
```

---

## 📝 Refactoring Tasks

### Phase 1: 구조 재조직 (Critical)

#### Task 1.1: pages/ 레이어 생성 및 마이그레이션
**목적**: 라우트 단위 페이지 컴포넌트를 별도 레이어로 분리

**Action Items**:
- [ ] `pages/` 디렉토리 생성
- [ ] 각 라우트별 페이지 슬라이스 생성:
  - `pages/home/` - 홈/대시보드 페이지
  - `pages/organizations/` - 조직 목록 페이지
  - `pages/organization-detail/` - 조직 상세 페이지
  - `pages/events/` - 모임 목록 페이지
  - `pages/event-detail/` - 모임 상세 페이지
  - `pages/members/` - 멤버 목록 페이지
  - `pages/analytics/` - 분석 대시보드 페이지
- [ ] `app/` 또는 `widgets/`에 있는 페이지 컴포넌트를 `pages/`로 이동
- [ ] 각 페이지 슬라이스에 `ui/` 세그먼트와 `index.ts` 생성

**Before**:
```typescript
// app/pages/OrganizationsPage.tsx (잘못된 위치)
export const OrganizationsPage = () => { /* ... */ }
```

**After**:
```typescript
// pages/organizations/ui/OrganizationsPage.tsx
export const OrganizationsPage = () => { /* ... */ }

// pages/organizations/index.ts
export { OrganizationsPage } from './ui/OrganizationsPage'
```

---

#### Task 1.2: store/ 제거 및 상태 재배치
**목적**: 전역 Zustand 스토어를 각 레이어의 `model/` 세그먼트로 분산

**Action Items**:
- [ ] `store/` 디렉토리 내 모든 스토어 파일 식별
- [ ] 각 스토어를 해당 엔티티/피처의 `model/` 세그먼트로 이동:
  - `store/organizationStore.ts` → `entities/organization/model/organizationStore.ts`
  - `store/memberStore.ts` → `entities/member/model/memberStore.ts`
  - `store/eventStore.ts` → `entities/event/model/eventStore.ts`
  - 피처별 스토어 → 해당 `features/*/model/` 이동
- [ ] 앱 전역 상태 (예: theme, auth)는 `app/providers/` 또는 `entities/session/`에 배치
- [ ] 모든 import 경로 업데이트
- [ ] `store/` 디렉토리 삭제

**Before**:
```typescript
// store/organizationStore.ts
import { create } from 'zustand'

export const useOrganizationStore = create((set) => ({
  organizations: [],
  setOrganizations: (orgs) => set({ organizations: orgs })
}))

// widgets/organization-list/OrganizationList.tsx
import { useOrganizationStore } from '@/store/organizationStore'
```

**After**:
```typescript
// entities/organization/model/organizationStore.ts
import { create } from 'zustand'

export const useOrganizationStore = create((set) => ({
  organizations: [],
  setOrganizations: (orgs) => set({ organizations: orgs })
}))

// entities/organization/index.ts
export { useOrganizationStore } from './model/organizationStore'

// widgets/organization-list/OrganizationList.tsx
import { useOrganizationStore } from '@/entities/organization'
```

---

#### Task 1.3: 레이어 의존성 검증 및 수정
**목적**: FSD 의존성 규칙 위반 사례 제거

**Action Items**:
- [ ] 각 레이어 파일에서 import 경로 분석:
  - `entities/`에서 `features/`, `widgets/`, `pages/` import 금지
  - `features/`에서 `widgets/`, `pages/` import 금지
  - `widgets/`에서 `pages/` import 금지
  - 같은 레이어 내 다른 슬라이스 직접 import 금지
- [ ] 위반 사례 발견 시:
  - 공통 로직 → `shared/`로 이동
  - 의존성 역전 패턴 적용 (Props/Callback으로 해결)
  - 필요 시 레이어 재조정 (하위로 이동)

**위반 예시 및 해결책**:

```typescript
// ❌ Bad: entities에서 features import
// entities/organization/ui/OrganizationCard.tsx
import { OrganizationForm } from '@/features/organization-form'

// ✅ Good: 의존성 역전 - Props로 해결
// entities/organization/ui/OrganizationCard.tsx
interface OrganizationCardProps {
  onEdit?: () => void  // 상위에서 주입
}

// widgets/organization-list/ui/OrganizationList.tsx
import { OrganizationCard } from '@/entities/organization'
import { useOrganizationForm } from '@/features/organization-form'

const List = () => {
  const { openForm } = useOrganizationForm()
  
  return <OrganizationCard onEdit={openForm} />
}
```

---

#### Task 1.4: Public API (index.ts) 생성
**목적**: 모든 슬라이스의 명시적 public interface 정의

**Action Items**:
- [ ] 각 슬라이스에 `index.ts` 생성 (없는 경우)
- [ ] 외부에서 사용할 컴포넌트, Hook, 타입만 export
- [ ] 내부 구현 세부사항은 export 금지 (private 유지)
- [ ] Barrel export 패턴 적용

**구현 예시**:
```typescript
// entities/organization/index.ts
// ✅ Public API만 export
export { OrganizationCard } from './ui/OrganizationCard'
export { useOrganization, useOrganizationStore } from './model'
export { fetchOrganizations, createOrganization } from './api'
export type { Organization, OrganizationFilters } from './model/types'

// ❌ 내부 구현은 export 하지 않음
// export { formatDate } from './lib/helpers' - 이건 내부용
```

---

### Phase 2: 네이밍 컨벤션 통일 (High Priority)

#### Task 2.1: 폴더 및 파일명 표준화

**네이밍 규칙**:

| 대상 | 규칙 | 예시 |
|------|------|------|
| **폴더명** | kebab-case | `organization-list/`, `date-range-filter/` |
| **React 컴포넌트** | PascalCase.tsx | `OrganizationCard.tsx`, `LoginForm.tsx` |
| **Hook 파일** | camelCase.ts with `use` prefix | `useAuth.ts`, `useOrganizationForm.ts` |
| **Store 파일** | camelCase.ts with `Store` suffix | `organizationStore.ts`, `themeStore.ts` |
| **API 함수 파일** | camelCase.ts with `Api` suffix | `organizationApi.ts`, `memberApi.ts` |
| **타입 정의** | PascalCase.types.ts or types.ts | `Organization.types.ts`, `types.ts` |
| **유틸리티 함수** | camelCase.ts | `formatDate.ts`, `validateEmail.ts` |
| **상수 파일** | camelCase.ts or UPPER_SNAKE_CASE.ts | `constants.ts`, `API_ENDPOINTS.ts` |

**Action Items**:
- [ ] 전체 `frontend/src/` 디렉토리 스캔하여 컨벤션 위반 파일/폴더 리스트 작성
- [ ] 일괄 이름 변경:
  - PascalCase 폴더 → kebab-case 변환
  - snake_case 파일 → camelCase 또는 PascalCase 변환
  - 불필요한 suffix/prefix 제거 (`.component`, `.container` 등)
- [ ] 모든 import 경로 자동 업데이트 (IDE refactor 기능 활용)

**변경 예시**:
```
❌ Before:
frontend/src/
├── Features/
│   ├── OrganizationForm/
│   │   └── organization_form.component.tsx
│   └── DateFilter/
│       └── DateRangeFilter.tsx
├── Entities/
│   └── Organization/
│       └── organization.card.tsx

✅ After:
frontend/src/
├── features/
│   ├── organization-form/
│   │   └── ui/
│   │       └── OrganizationForm.tsx
│   └── date-range-filter/
│       └── ui/
│           └── DateRangeFilter.tsx
├── entities/
│   └── organization/
│       └── ui/
│           └── OrganizationCard.tsx
```

---

#### Task 2.2: 코드 내 변수/함수명 리팩터링

**네이밍 규칙**:

| 대상 | 규칙 | 예시 |
|------|------|------|
| **변수/함수** | camelCase | `organizationList`, `fetchUserData` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| **타입/인터페이스** | PascalCase | `Organization`, `ApiResponse` |
| **Enum** | PascalCase (key도 PascalCase) | `enum Status { Active, Inactive }` |
| **Boolean 변수** | `is`, `has`, `should` prefix | `isLoading`, `hasError`, `shouldShow` |
| **Event Handler** | `handle` or `on` prefix | `handleClick`, `onSubmit` |

**Action Items**:
- [ ] 비직관적인 약어 제거:
  - `org` → `organization`
  - `evt` → `event`
  - `mem` → `member`
  - `res` → `response`
  - `err` → `error`
- [ ] Boolean 변수에 적절한 prefix 추가
- [ ] 단일 문자 변수명 제거 (루프 인덱스 제외)
- [ ] 함수명에 동사 포함 (명확한 액션 표현)

**개선 예시**:
```typescript
// ❌ Before
const org = getOrg()
const data = fetchData()
const flag = true
const click = () => {}
const x = organizations.filter(o => o.active)

// ✅ After
const organization = getOrganization()
const organizationList = fetchOrganizations()
const isActiveFilterEnabled = true
const handleFilterClick = () => {}
const activeOrganizations = organizations.filter(org => org.isActive)
```

---

#### Task 2.3: 컴포넌트명과 파일명 일치 강제

**규칙**: 파일명과 default export 컴포넌트명은 반드시 일치

**Action Items**:
- [ ] 불일치 사례 검색 및 수정
- [ ] Named export 사용 시 파일명과 동일한 이름으로 export

**수정 예시**:
```typescript
// ❌ Bad: 파일명과 컴포넌트명 불일치
// file: OrganizationCard.tsx
export const OrgCard = () => { /* ... */ }

// ✅ Good: 일치
// file: OrganizationCard.tsx
export const OrganizationCard = () => { /* ... */ }
```

---

### Phase 3: 코드 분리 및 모듈화 (Medium Priority)

#### Task 3.1: 거대 파일 분리

**기준**: 다음 중 하나 이상 해당 시 분리 필요
- 200줄 이상의 단일 컴포넌트 파일
- 3개 이상의 별도 비즈니스 로직이 섞여 있는 경우
- 5개 이상의 useState 또는 복잡한 상태 로직

**Action Items**:
- [ ] 대상 파일 식별 (LOC 기준 스캔)
- [ ] 분리 전략 수립:
  - **UI 분리**: 서브 컴포넌트 추출 (atoms/molecules 패턴)
  - **로직 분리**: Custom Hook으로 추출
  - **상태 분리**: Zustand store 또는 Context로 추출
  - **유틸리티 분리**: `lib/` 세그먼트로 이동

**분리 예시**:

**Before** (300줄의 거대 컴포넌트):
```typescript
// features/organization-form/OrganizationForm.tsx (300 lines)
export const OrganizationForm = () => {
  // 50줄: 폼 상태 관리
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  // ...

  // 100줄: 폼 검증 로직
  const validateName = () => { /* ... */ }
  const validateDescription = () => { /* ... */ }
  // ...

  // 50줄: API 호출 로직
  const handleSubmit = async () => { /* ... */ }
  
  // 100줄: JSX
  return <form>...</form>
}
```

**After** (모듈화):
```typescript
// features/organization-form/model/useOrganizationForm.ts
export const useOrganizationForm = () => {
  const [formData, setFormData] = useState(initialState)
  
  const handleSubmit = async () => {
    // API 호출 로직
  }
  
  return { formData, handleSubmit, /* ... */ }
}

// features/organization-form/lib/validation.ts
export const validateOrganizationForm = (data) => {
  // 검증 로직
}

// features/organization-form/ui/OrganizationForm.tsx (100 lines)
import { useOrganizationForm } from '../model/useOrganizationForm'
import { OrganizationFormFields } from './OrganizationFormFields'
import { OrganizationFormActions } from './OrganizationFormActions'

export const OrganizationForm = () => {
  const { formData, handleSubmit } = useOrganizationForm()
  
  return (
    <form onSubmit={handleSubmit}>
      <OrganizationFormFields data={formData} />
      <OrganizationFormActions />
    </form>
  )
}

// features/organization-form/ui/OrganizationFormFields.tsx
export const OrganizationFormFields = ({ data }) => {
  // 필드 렌더링만 담당
}

// features/organization-form/ui/OrganizationFormActions.tsx
export const OrganizationFormActions = () => {
  // 버튼/액션 렌더링만 담당
}
```

---

#### Task 3.2: 중복 코드 제거

**Action Items**:
- [ ] 중복 코드 패턴 식별:
  - 유사한 API 호출 로직
  - 반복되는 데이터 변환 로직
  - 동일한 스타일/레이아웃 패턴
- [ ] 공통화 전략:
  - 공통 Hook → `shared/hooks/`
  - 공통 유틸 함수 → `shared/lib/`
  - 공통 컴포넌트 → `shared/ui/`
  - 공통 API 로직 → `shared/api/`

**중복 제거 예시**:

**Before** (중복):
```typescript
// features/organization-form/ui/OrganizationForm.tsx
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    navigate('/login')
  } else {
    message.error('오류가 발생했습니다')
  }
}

// features/event-form/ui/EventForm.tsx
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    navigate('/login')
  } else {
    message.error('오류가 발생했습니다')
  }
}
```

**After** (공통화):
```typescript
// shared/lib/api/handleApiError.ts
export const handleApiError = (error: ApiError, navigate: NavigateFunction) => {
  if (error.response?.status === 401) {
    navigate('/login')
  } else {
    message.error(error.message || '오류가 발생했습니다')
  }
}

// shared/hooks/useApiError.ts
export const useApiError = () => {
  const navigate = useNavigate()
  
  return (error: ApiError) => handleApiError(error, navigate)
}

// features/organization-form/ui/OrganizationForm.tsx
import { useApiError } from '@/shared/hooks/useApiError'

const OrganizationForm = () => {
  const handleError = useApiError()
  
  // 사용: handleError(error)
}
```

---

#### Task 3.3: shared/ 레이어 강화

**목적**: 재사용 가능한 공통 요소를 체계적으로 구성

**Action Items**:
- [ ] `shared/ui/` 컴포넌트 정리:
  - Ant Design 래핑 컴포넌트 생성 (일관된 스타일/동작)
  - 재사용되는 커스텀 컴포넌트 이동
  - Atomic Design 패턴 고려 (atoms, molecules)
- [ ] `shared/lib/` 유틸리티 분류:
  - `date/` - 날짜 관련 유틸
  - `string/` - 문자열 처리
  - `validation/` - 검증 함수
  - `format/` - 포맷팅 함수
- [ ] `shared/hooks/` 공통 Hook 추가:
  - `useDebounce.ts`
  - `useLocalStorage.ts`
  - `useMediaQuery.ts`
  - `useIntersectionObserver.ts`
- [ ] `shared/api/` API 클라이언트 강화:
  - Axios/Fetch 인터셉터 설정
  - 에러 핸들링 표준화
  - 요청/응답 타입 정의

**구조 예시**:
```typescript
// shared/ui/button/Button.tsx
import { Button as AntButton, ButtonProps } from 'antd'
import { FC } from 'react'

export const Button: FC<ButtonProps> = (props) => {
  // 프로젝트 공통 스타일/동작 적용
  return <AntButton {...props} className={`custom-btn ${props.className}`} />
}

// shared/lib/date/formatDate.ts
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  // 날짜 포맷팅 로직
}

export const getRelativeTime = (date: Date): string => {
  // "3일 전", "방금 전" 등
}

// shared/hooks/useDebounce.ts
export const useDebounce = <T,>(value: T, delay: number): T => {
  // 디바운스 로직
}
```

---

### Phase 4: 타입 안정성 강화 (Low Priority but Important)

#### Task 4.1: any 타입 제거

**Action Items**:
- [ ] 프로젝트 전체에서 `any` 타입 검색
- [ ] 적절한 타입으로 교체:
  - API 응답 → 명시적 인터페이스
  - Event 객체 → React 타입 (React.MouseEvent 등)
  - 동적 객체 → Record 또는 인터페이스
- [ ] `unknown` 사용이 적절한 경우 명시

**개선 예시**:
```typescript
// ❌ Before
const handleResponse = (data: any) => {
  console.log(data.name)
}

const handleClick = (e: any) => {
  e.preventDefault()
}

// ✅ After
interface OrganizationResponse {
  name: string
  description: string
  members: Member[]
}

const handleResponse = (data: OrganizationResponse) => {
  console.log(data.name)
}

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
}
```

---

#### Task 4.2: 공통 타입 정의 표준화

**Action Items**:
- [ ] 엔티티별 타입 파일 생성:
  - `entities/organization/model/types.ts`
  - `entities/member/model/types.ts`
  - `entities/event/model/types.ts`
- [ ] 공통 타입은 `shared/types/`에 배치:
  - `common.ts` - Pagination, ApiResponse 등
  - `api.ts` - 요청/응답 기본 구조
- [ ] 타입 import는 `type` 키워드 사용 (번들 사이즈 최적화)

**타입 정의 예시**:
```typescript
// shared/types/common.ts
export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// entities/organization/model/types.ts
import type { Pagination } from '@/shared/types/common'

export interface Organization {
  id: string
  name: string
  description: string
  createdAt: Date
  members: string[]  // Member IDs
}

export interface OrganizationFilters {
  search?: string
  isActive?: boolean
  pagination?: Pagination
}

// 사용처
import type { Organization } from '@/entities/organization'
```

---

## 🚀 Implementation Plan

### Timeline & Phases

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|----------------|----------|
| **Phase 1** | 구조 재조직 (Tasks 1.1-1.4) | 3-5일 | 🔴 Critical |
| **Phase 2** | 네이밍 통일 (Tasks 2.1-2.3) | 2-3일 | 🟡 High |
| **Phase 3** | 코드 분리 (Tasks 3.1-3.3) | 3-4일 | 🟢 Medium |
| **Phase 4** | 타입 강화 (Tasks 4.1-4.2) | 1-2일 | 🔵 Low |
| **총계** | | **9-14일** | |

### 우선순위 전략

1. **Phase 1 먼저 완료**: FSD 구조가 확립되어야 이후 작업이 의미 있음
2. **점진적 마이그레이션**: 한 번에 전체를 바꾸지 말고 슬라이스 단위로 진행
3. **테스트 병행**: 각 Phase 완료 후 기능 테스트 수행
4. **문서화**: 변경사항을 팀과 공유 (변경 로그 작성)

---

## ✅ Definition of Done (DoD)

각 Task가 완료되었다고 판단하는 기준:

### 구조 관련
- [ ] 모든 파일이 올바른 FSD 레이어에 위치
- [ ] 각 슬라이스에 `index.ts` (Public API) 존재
- [ ] 레이어 의존성 규칙 위반 0건
- [ ] `store/` 디렉토리 제거 완료

### 네이밍 관련
- [ ] 모든 폴더명이 kebab-case
- [ ] 모든 컴포넌트 파일명이 PascalCase
- [ ] 모든 Hook 파일명이 camelCase with `use` prefix
- [ ] 파일명과 export 컴포넌트명 100% 일치

### 코드 품질 관련
- [ ] 200줄 이상 파일 0개 (특수 케이스 제외)
- [ ] 중복 코드 패턴 제거
- [ ] `any` 타입 사용 최소화 (불가피한 경우만 주석과 함께)
- [ ] 모든 Public API에 JSDoc 주석 추가

### 기능 관련 (최우선)
- [ ] 모든 기존 기능 정상 동작 확인
- [ ] E2E 테스트 통과 (있는 경우)
- [ ] 빌드 에러 0건
- [ ] 런타임 에러 0건
- [ ] 브라우저 콘솔 경고 0건

---

## 🔍 Verification & Testing

### 자동화된 검증

#### 1. ESLint 규칙 추가
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // FSD 의존성 검증
    'import/no-restricted-paths': ['error', {
      zones: [
        { target: './src/entities', from: './src/features' },
        { target: './src/entities', from: './src/widgets' },
        { target: './src/features', from: './src/widgets' },
        // ... 기타 규칙
      ]
    }],
    
    // any 타입 금지
    '@typescript-eslint/no-explicit-any': 'error',
    
    // 파일명 규칙 검증
    'unicorn/filename-case': ['error', {
      case: 'kebabCase',
      ignore: ['\\.tsx$'] // 컴포넌트 파일은 PascalCase
    }]
  }
}
```

#### 2. 커스텀 검증 스크립트
```typescript
// scripts/verify-fsd-structure.ts
/**
 * FSD 구조 검증 스크립트
 * - Public API (index.ts) 존재 여부
 * - 파일명 컨벤션 준수 여부
 * - 레이어 의존성 위반 여부
 */
import { verifyStructure } from './lib/fsd-validator'

verifyStructure('./src')
  .then(report => {
    console.log(report)
    if (report.violations > 0) process.exit(1)
  })
```

### 수동 테스트 체크리스트

리팩터링 후 다음 시나리오를 수동으로 테스트:

#### 조직 관리
- [ ] 조직 목록 조회
- [ ] 조직 생성
- [ ] 조직 수정
- [ ] 조직 삭제
- [ ] 조직 검색/필터링

#### 모임 관리
- [ ] 모임 생성
- [ ] 참가자 추가/제거
- [ ] 모임 상세 조회
- [ ] 모임 수정/삭제

#### 분석 대시보드
- [ ] 멤버별 참여율 조회
- [ ] 모임별 참여 현황 조회
- [ ] 실시간 통계 업데이트
- [ ] 날짜 범위 필터 적용

#### 인증/권한
- [ ] 로그인/로그아웃
- [ ] 권한별 페이지 접근 제어
- [ ] JWT 토큰 갱신

---

## 📚 Reference Documents

### FSD 공식 문서
- [Feature-Sliced Design 공식 사이트](https://feature-sliced.design/)
- [FSD GitHub](https://github.com/feature-sliced/documentation)
- [FSD 예제 프로젝트](https://github.com/feature-sliced/examples)

### 네이밍 컨벤션
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### 리팩터링 패턴
- [Refactoring.Guru](https://refactoring.guru/)
- [Clean Code in TypeScript](https://github.com/labs42io/clean-code-typescript)

---

## ⚠️ Risk Management

### 잠재적 위험 요소

| 위험 | 영향도 | 완화 전략 |
|------|--------|-----------|
| 기능 손상 | 🔴 High | 각 Phase 후 철저한 테스트, 기능별 브랜치 사용 |
| 일정 지연 | 🟡 Medium | 점진적 마이그레이션, 우선순위 기반 진행 |
| 팀원 학습 곡선 | 🟢 Low | FSD 가이드 문서 작성, 페어 프로그래밍 |
| Merge 충돌 | 🟡 Medium | 작은 단위로 자주 머지, 명확한 커밋 메시지 |

### Rollback 전략

1. **Git Branch 전략**: 
   - `refactor/phase-1`, `refactor/phase-2` 등 Phase별 브랜치
   - 문제 발생 시 이전 Phase 브랜치로 롤백
   
2. **Commit 단위**:
   - 각 Task는 독립적인 커밋으로 분리
   - Revert 가능하도록 명확한 커밋 메시지

3. **백업**:
   - 리팩터링 시작 전 전체 코드베이스 백업
   - 중요 변경 시점마다 Git Tag 생성

---

## 💡 Success Metrics

리팩터링 성공 여부를 측정하는 지표:

### 정량적 지표
- [ ] **레이어 의존성 준수율**: 100%
- [ ] **파일명 컨벤션 준수율**: 100%
- [ ] **평균 파일 LOC**: 150줄 이하
- [ ] **중복 코드율**: 5% 이하
- [ ] **TypeScript strict 모드**: 활성화 및 에러 0건
- [ ] **빌드 시간**: 기존 대비 유지 또는 개선
- [ ] **번들 크기**: 기존 대비 10% 이내 증가 허용

### 정성적 지표
- [ ] 새로운 팀원이 프로젝트 구조를 이해하는 시간 50% 단축
- [ ] 새로운 기능 추가 시 파일 위치를 즉시 파악 가능
- [ ] 코드 리뷰 시 구조 관련 피드백 감소
- [ ] 버그 발생률 감소 (구조 개선으로 인한 효과)

---

## 🎯 Post-Refactoring Tasks

리팩터링 완료 후 추가 작업:

### 1. 문서화
- [ ] 새로운 프로젝트 구조 README 업데이트
- [ ] FSD 가이드 문서 작성 (`docs/FSD_GUIDE.md`)
- [ ] 주요 변경사항 CHANGELOG 작성
- [ ] 컨트리뷰션 가이드 업데이트

### 2. 개발 환경 개선
- [ ] Path alias 최적화 (tsconfig.json, vite.config.ts)
- [ ] Snippet/템플릿 생성 (Cursor AI, VS Code)
- [ ] Pre-commit hook 설정 (Husky + lint-staged)
- [ ] CI/CD에 구조 검증 추가

### 3. 팀 교육
- [ ] FSD 패턴 팀 세션 진행
- [ ] 리팩터링 결과 공유 회의
- [ ] Q&A 문서 작성
- [ ] 베스트 프랙티스 공유

---

## 📞 Contact & Support

리팩터링 진행 중 문의사항이나 이슈 발생 시:

- **GitHub Issues**: [프로젝트 Issues 페이지](https://github.com/dlwlsdn201/project--manage-organization-participation/issues)
- **Discussion**: 팀 내 Slack/Discord 채널 활용
- **Documentation**: `docs/` 폴더 내 가이드 문서 참조

---

## 📝 Appendix

### A. 자주 묻는 질문 (FAQ)

**Q1: 기존 코드를 한 번에 모두 리팩터링해야 하나요?**
A: 아니요. Phase 단위로, 그리고 각 Phase 내에서도 슬라이스 단위로 점진적으로 진행하세요.

**Q2: 어떤 파일부터 시작하는 것이 좋나요?**
A: 의존성이 적은 `entities/` 레이어부터 시작하여 상위 레이어로 올라가는 것을 권장합니다.

**Q3: Zustand store를 여러 레이어에 분산하면 전역 상태 관리가 복잡해지지 않나요?**
A: 각 레이어의 store는 해당 도메인의 상태만 관리하므로 오히려 명확해집니다. 여러 레이어에서 공유해야 하는 상태는 `entities/session/` 등 적절한 엔티티로 추상화하세요.

**Q4: Ant Design 컴포넌트를 shared/ui/로 래핑해야 하나요?**
A: 프로젝트 전체에서 공통 스타일이나 동작이 필요한 경우 래핑을 권장합니다. 그렇지 않으면 직접 사용해도 됩니다.

**Q5: 리팩터링 중에 새로운 기능 개발도 병행할 수 있나요?**
A: 가능하지만 권장하지 않습니다. 리팩터링과 기능 개발을 분리하여 Merge 충돌을 최소화하세요.

### B. 용어 정리

- **Layer (레이어)**: FSD 아키텍처의 계층 (app, pages, widgets, features, entities, shared)
- **Slice (슬라이스)**: 각 레이어 내의 도메인 단위 모듈 (예: `entities/organization`)
- **Segment (세그먼트)**: 슬라이스 내의 기술적 분류 (ui, model, api, lib 등)
- **Public API**: 슬라이스의 `index.ts`를 통해 외부로 노출되는 인터페이스
- **Cross-import**: FSD 규칙을 위반하는 잘못된 import (상위 레이어 import, 동일 레이어 간 import)

### C. 체크리스트 템플릿

리팩터링 진행 시 사용할 체크리스트:

```markdown
## [Slice Name] 리팩터링 체크리스트

### 구조
- [ ] 올바른 레이어에 위치
- [ ] 적절한 세그먼트 구성 (ui, model, api, lib)
- [ ] index.ts (Public API) 생성
- [ ] 의존성 규칙 준수

### 네이밍
- [ ] 폴더명: kebab-case
- [ ] 컴포넌트 파일명: PascalCase
- [ ] Hook 파일명: camelCase with `use` prefix
- [ ] 함수/변수명: 직관적이고 명확
- [ ] 파일명과 export명 일치

### 코드 품질
- [ ] 파일 크기 적절 (200줄 이하)
- [ ] 단일 책임 원칙 준수
- [ ] 중복 코드 제거
- [ ] any 타입 제거
- [ ] JSDoc 주석 추가

### 테스트
- [ ] 기능 정상 동작 확인
- [ ] 빌드 에러 없음
- [ ] 콘솔 경고 없음
- [ ] 관련 E2E 테스트 통과

### 문서화
- [ ] 변경사항 기록
- [ ] 팀원 리뷰 완료
```

---

## 🛠️ CURSOR AI 활용 가이드

Cursor AI를 활용하여 이 PRD를 효과적으로 실행하는 방법:

### 1. 프롬프트 전략

#### Phase별 실행 프롬프트

**Phase 1: 구조 재조직**
```
Task: FSD 구조 리팩터링 - pages/ 레이어 생성

Context:
- 현재 frontend/src/ 구조에서 pages/ 레이어가 누락되어 있음
- 라우트 단위 페이지 컴포넌트들이 app/ 또는 widgets/에 혼재

Instructions:
1. frontend/src/pages/ 디렉토리 생성
2. 다음 페이지 슬라이스 생성 (각각 ui/ 세그먼트와 index.ts 포함):
   - home/
   - organizations/
   - organization-detail/
   - events/
   - event-detail/
   - members/
   - analytics/
3. 현재 [파일 경로들]에서 페이지 컴포넌트를 식별하여 적절한 pages/ 슬라이스로 이동
4. 모든 import 경로 업데이트
5. app/routes/ 에서 라우팅 설정 업데이트

Requirements:
- 모든 기능은 정상 동작 유지
- 각 슬라이스는 Public API (index.ts) 필수
- 파일명은 PascalCase (예: HomePage.tsx)
- 폴더명은 kebab-case

참고: 이 작업은 FSD Phase 1.1에 해당하며, PRD 문서의 "Task 1.1: pages/ 레이어 생성 및 마이그레이션" 섹션을 따릅니다.
```

**Phase 2: 네이밍 통일**
```
Task: 파일 및 폴더 네이밍 컨벤션 통일

Context:
- 현재 [경로]에 네이밍 컨벤션이 일관되지 않은 파일/폴더 존재
- PascalCase, camelCase, kebab-case, snake_case가 혼재

Instructions:
1. frontend/src/ 전체를 스캔하여 다음 규칙 위반 사항 식별:
   - 폴더명이 kebab-case가 아닌 경우
   - React 컴포넌트 파일명이 PascalCase가 아닌 경우
   - Hook 파일명이 camelCase + 'use' prefix가 아닌 경우
   - 불필요한 suffix가 있는 경우 (.component, .container 등)

2. 모든 위반 사항을 규칙에 맞게 일괄 수정:
   - 폴더명 → kebab-case
   - 컴포넌트 파일 → PascalCase.tsx
   - Hook 파일 → useXxx.ts
   - 유틸 파일 → camelCase.ts

3. 모든 import 경로 자동 업데이트

4. 변경 목록 리포트 생성

Requirements:
- IDE의 안전한 리팩터링 기능 사용
- 모든 import 경로가 올바르게 업데이트되었는지 검증
- 빌드 에러 없음

참고: PRD의 "Task 2.1: 폴더 및 파일명 표준화" 섹션 참조
```

**Phase 3: 코드 분리**
```
Task: 거대 컴포넌트 파일 분리 - [특정 파일명]

Context:
- [파일 경로]가 [N]줄로 너무 방대함
- UI 렌더링, 비즈니스 로직, 상태 관리, API 호출이 혼재

Analysis Request:
1. 이 파일을 분석하여 다음을 식별:
   - UI 컴포넌트 부분
   - 비즈니스 로직 (useEffect, 계산 로직 등)
   - 상태 관리
   - API 호출
   - 유틸리티 함수

2. 분리 전략 제안:
   - 어떤 부분을 별도 파일로 추출할지
   - 적절한 파일명과 위치
   - Custom Hook 추출 가능 여부

3. 분리 실행:
   - UI는 서브 컴포넌트로 분리 (같은 ui/ 내)
   - 로직은 model/useXxx.ts로 추출
   - 유틸은 lib/로 추출
   - 메인 컴포넌트는 조립만 담당

4. 모든 타입 정의도 적절히 분리

Requirements:
- 기능 정상 동작 유지
- 각 파일은 150줄 이하 목표
- 명확한 단일 책임

참고: PRD의 "Task 3.1: 거대 파일 분리" 섹션 참조
```

### 2. 단계별 실행 전략

#### Step 1: 현재 상태 분석
```
@workspace 현재 frontend/src/ 구조를 분석하여 다음을 리포트해줘:

1. 각 레이어(app, entities, features, widgets, store)의 파일 목록
2. FSD 원칙 위반 사항:
   - pages/ 레이어 누락
   - store/ 디렉토리 분리 이슈
   - 잠재적 레이어 의존성 위반
3. 네이밍 컨벤션 위반 사항:
   - 규칙에 맞지 않는 폴더/파일명 리스트
4. 200줄 이상의 파일 목록
5. Public API (index.ts) 누락 슬라이스

분석 결과를 마크다운 표 형식으로 정리해줘.
```

#### Step 2: 우선순위 작업 목록 생성
```
방금 분석 결과를 바탕으로, PRD의 Phase 1-4 작업을 실행 가능한 순서대로 정리하여 체크리스트를 만들어줘.

각 작업에는 다음을 포함:
- 작업명
- 예상 소요 시간
- 의존성 (선행 작업)
- 위험도
- 구체적인 파일 경로

우선순위는 다음 기준으로:
1. FSD 구조 정합성 (Critical)
2. 빌드 에러 가능성 높은 작업
3. 네이밍 통일
4. 코드 분리
```

#### Step 3: 점진적 실행
```
[특정 작업]을 실행해줘.

진행 방식:
1. 변경 전 현재 코드 백업 (주석으로 표시)
2. 변경 실행
3. import 경로 자동 업데이트
4. 빌드 테스트
5. 변경사항 요약 리포트

작업 중 예상치 못한 이슈 발견 시 중단하고 알려줘.
```

### 3. Cursor AI 컨텍스트 관리

#### PRD를 Cursor에 전달하는 방법

**Option 1: Composer 모드 활용**
```
이 PRD 문서를 기반으로 frontend/ 리팩터링을 진행할 예정이야.

[PRD 전체 또는 관련 섹션 붙여넣기]

먼저 현재 코드 구조를 분석하고, Phase 1 작업부터 단계적으로 진행하자.
```

**Option 2: .cursorrules 파일 생성**
```
# .cursorrules
이 프로젝트는 Feature-Sliced Design (FSD) 아키텍처를 따릅니다.

## 구조 규칙
- 레이어: app → pages → widgets → features → entities → shared
- 하위 레이어만 import 가능
- 각 슬라이스는 index.ts를 통해 Public API 제공

## 네이밍 규칙
- 폴더: kebab-case
- 컴포넌트: PascalCase.tsx
- Hook: useXxx.ts
- 유틸: camelCase.ts

## 금지 사항
- any 타입 사용
- 상위 레이어 import
- 200줄 이상 파일 (특수 케이스 제외)

코드 생성 또는 수정 시 위 규칙을 엄격히 준수하세요.
```

**Option 3: 태그 활용**
```
@[PRD-파일명].md 이 PRD에 따라 [특정 작업] 실행해줘
```

### 4. 검증 프롬프트

각 Phase 완료 후 실행:

```
Phase [N] 작업이 완료되었어. 다음을 검증해줘:

1. FSD 구조 검증:
   - 모든 파일이 올바른 레이어에 위치하는가?
   - 레이어 의존성 규칙을 위반하는 import가 있는가?
   - 모든 슬라이스에 index.ts가 있는가?

2. 네이밍 검증:
   - 폴더명이 모두 kebab-case인가?
   - 컴포넌트 파일명이 모두 PascalCase인가?
   - 파일명과 export명이 일치하는가?

3. 빌드 검증:
   - TypeScript 컴파일 에러가 있는가?
   - 순환 의존성이 있는가?
   - 누락된 import가 있는가?

4. 기능 검증 가이드:
   - 테스트해야 할 주요 기능 목록 제공

검증 결과를 리포트 형식으로 정리하고, 이슈가 있으면 수정 방법 제안해줘.
```

### 5. 자동화 스크립트 생성 요청

```
다음 검증 작업을 자동으로 수행하는 Node.js 스크립트를 작성해줘:

scripts/verify-fsd.js

기능:
1. 모든 슬라이스에 index.ts가 있는지 확인
2. 폴더명이 kebab-case인지 확인
3. 컴포넌트 파일명이 PascalCase인지 확인
4. 레이어 간 잘못된 import 탐지
5. 200줄 이상 파일 목록 출력
6. any 타입 사용 현황 리포트

출력: JSON 형식의 검증 리포트
```

---

## 📋 실전 워크플로우 예시

### Scenario: organization-form 피처 리팩터링

#### Before (문제 상황)
```
features/
└── OrganizationForm/
    └── organization_form.component.tsx  (350 lines)
        ├── 폼 상태 관리 (50 lines)
        ├── 검증 로직 (80 lines)
        ├── API 호출 (60 lines)
        ├── 멤버 선택 로직 (40 lines)
        └── UI 렌더링 (120 lines)
```

**문제점**:
- ❌ 폴더명 PascalCase (OrganizationForm)
- ❌ 파일명 snake_case + suffix (.component)
- ❌ 단일 파일 350줄 (과도한 책임)
- ❌ Public API 없음

#### Cursor AI 프롬프트 시퀀스

**Step 1: 구조 분석**
```
@features/OrganizationForm/organization_form.component.tsx

이 파일을 FSD 원칙에 맞게 리팩터링하려고 해.

먼저 다음을 분석해줘:
1. 이 파일의 책임을 카테고리별로 분류 (상태 관리, 로직, UI 등)
2. 각 카테고리의 코드 라인 수
3. 추출 가능한 custom hook 목록
4. 분리 가능한 서브 컴포넌트 목록
5. 유틸리티 함수로 분리 가능한 부분

분석 결과를 바탕으로 리팩터링 계획을 제시해줘.
```

**Step 2: 리팩터링 실행**
```
분석 결과를 바탕으로 다음 구조로 리팩터링 실행해줘:

features/
└── organization-form/
    ├── ui/
    │   ├── OrganizationForm.tsx (메인 컴포넌트, 조립만)
    │   ├── OrganizationFormFields.tsx (폼 필드)
    │   ├── MemberSelector.tsx (멤버 선택)
    │   └── FormActions.tsx (버튼/액션)
    ├── model/
    │   ├── useOrganizationForm.ts (폼 상태 관리)
    │   └── organizationFormStore.ts (Zustand store, 필요시)
    ├── lib/
    │   └── validation.ts (검증 로직)
    ├── api/
    │   └── createOrganization.ts (API 호출)
    └── index.ts (Public API)

요구사항:
- 각 파일은 150줄 이하
- 명확한 단일 책임
- 모든 타입 정의 포함
- JSDoc 주석 추가
- 기능 정상 동작 유지
```

**Step 3: 검증**
```
리팩터링 완료된 organization-form 슬라이스를 검증해줘:

1. 파일 구조가 FSD 원칙에 맞는가?
2. 모든 파일이 150줄 이하인가?
3. Public API (index.ts)가 올바른가?
4. import 경로가 모두 올바른가?
5. TypeScript 에러가 없는가?

검증 후 이슈가 있으면 수정해줘.
```

**Step 4: 통합 테스트 가이드**
```
organization-form 리팩터링이 기존 기능에 영향을 주지 않았는지 확인하기 위한 테스트 시나리오를 작성해줘:

1. 수동 테스트 체크리스트
2. 테스트해야 할 엣지 케이스
3. 예상 가능한 회귀 버그 포인트
```

#### After (리팩터링 완료)
```
features/
└── organization-form/
    ├── ui/
    │   ├── OrganizationForm.tsx           (80 lines)
    │   ├── OrganizationFormFields.tsx     (60 lines)
    │   ├── MemberSelector.tsx             (70 lines)
    │   └── FormActions.tsx                (40 lines)
    ├── model/
    │   ├── useOrganizationForm.ts         (100 lines)
    │   └── types.ts                       (30 lines)
    ├── lib/
    │   └── validation.ts                  (80 lines)
    ├── api/
    │   └── createOrganization.ts          (50 lines)
    └── index.ts                           (10 lines)
```

**개선 결과**:
- ✅ 폴더명 kebab-case
- ✅ 파일명 규칙 준수
- ✅ 적절한 파일 분리 (평균 60줄)
- ✅ Public API 제공
- ✅ 명확한 책임 분리

---

## 🔧 Troubleshooting Guide

### 자주 발생하는 이슈와 해결책

#### Issue 1: 순환 의존성 발생
**증상**:
```
Dependency cycle detected:
features/organization-form → entities/organization → features/organization-form
```

**원인**: 레이어 간 잘못된 import

**해결책**:
```typescript
// ❌ Bad: entities에서 features import
// entities/organization/ui/OrganizationCard.tsx
import { OrganizationForm } from '@/features/organization-form'

// ✅ Good 1: Props로 의존성 주입
// entities/organization/ui/OrganizationCard.tsx
interface OrganizationCardProps {
  onEdit?: (org: Organization) => void
}

// widgets/organization-list/ui/OrganizationList.tsx
import { OrganizationCard } from '@/entities/organization'
import { useOrganizationForm } from '@/features/organization-form'

const List = () => {
  const { openForm } = useOrganizationForm()
  return <OrganizationCard onEdit={openForm} />
}

// ✅ Good 2: 공통 로직을 shared로 이동
// shared/lib/organization/formatOrganization.ts
export const formatOrganizationName = (org) => { /* ... */ }

// 양쪽에서 shared import
import { formatOrganizationName } from '@/shared/lib/organization'
```

#### Issue 2: Zustand Store 마이그레이션 후 상태 유실
**증상**: store/ 이동 후 일부 컴포넌트에서 상태가 undefined

**원인**: Import 경로 업데이트 누락

**해결책**:
```bash
# 전역 검색으로 모든 import 찾기
grep -r "from '@/store/organizationStore'" frontend/src/

# 일괄 치환 (sed 사용)
find frontend/src -type f -name "*.ts*" -exec sed -i 's|@/store/organizationStore|@/entities/organization|g' {} +

# 또는 Cursor AI에게 요청
```

```
@workspace 
'@/store/organizationStore'를 import하는 모든 파일을 찾아서 
'@/entities/organization'로 변경해줘.

변경 전후를 비교할 수 있도록 리포트도 생성해줘.
```

#### Issue 3: Public API export 누락으로 인한 빌드 에러
**증상**:
```
Module '"@/entities/organization"' has no exported member 'OrganizationCard'
```

**원인**: index.ts에서 export 누락

**해결책**:
```typescript
// entities/organization/index.ts

// ✅ 모든 Public API 명시적으로 export
export { OrganizationCard } from './ui/OrganizationCard'
export { useOrganization, useOrganizationStore } from './model'
export { 
  fetchOrganizations, 
  createOrganization, 
  updateOrganization,
  deleteOrganization 
} from './api'
export type { Organization, OrganizationFilters } from './model/types'
```

#### Issue 4: 대용량 파일 분리 후 Props Drilling
**증상**: 컴포넌트 분리 후 props가 5단계 이상 전달됨

**원인**: 과도한 컴포넌트 분리

**해결책**:
```typescript
// ❌ Bad: Props Drilling
<Parent data={data}>
  <Child1 data={data}>
    <Child2 data={data}>
      <Child3 data={data}>
        <Child4 data={data} />

// ✅ Good 1: Context 사용
// features/organization-form/model/OrganizationFormContext.tsx
const OrganizationFormContext = createContext()

export const OrganizationFormProvider = ({ children, initialData }) => {
  const value = useOrganizationForm(initialData)
  return (
    <OrganizationFormContext.Provider value={value}>
      {children}
    </OrganizationFormContext.Provider>
  )
}

export const useOrganizationFormContext = () => {
  const context = useContext(OrganizationFormContext)
  if (!context) throw new Error('Provider 필요')
  return context
}

// ✅ Good 2: Zustand Store 활용
// features/organization-form/model/organizationFormStore.ts
export const useOrganizationFormStore = create((set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data })
}))

// 하위 컴포넌트에서 직접 사용
const Child4 = () => {
  const formData = useOrganizationFormStore(state => state.formData)
  // Props 전달 불필요
}
```

#### Issue 5: Path Alias 인식 안됨
**증상**:
```
Cannot find module '@/entities/organization'
```

**원인**: tsconfig.json 또는 vite.config.ts 설정 누락

**해결책**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/widgets/*": ["./src/widgets/*"],
      "@/features/*": ["./src/features/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/shared': path.resolve(__dirname, './src/shared')
    }
  }
})
```

---

## 📚 추가 리소스

### FSD 관련 도구

1. **@feature-sliced/eslint-config**
   - FSD 규칙을 자동으로 검증하는 ESLint 플러그인
   ```bash
   npm install -D @feature-sliced/eslint-config
   ```

2. **Steiger**
   - FSD 아키텍처 의존성 검증 도구
   ```bash
   npx steiger src
   ```

3. **FSD Inspector** (VS Code Extension)
   - FSD 구조 시각화 및 검증

### 학습 자료

- [FSD 공식 튜토리얼](https://feature-sliced.design/docs/get-started/tutorial)
- [FSD 실전 예제 (React + TypeScript)](https://github.com/feature-sliced/examples/tree/master/react-typescript)
- [FSD Discord 커뮤니티](https://discord.gg/S8MzWTUsmp)

### 코드 품질 도구 설정

```json
// .eslintrc.json (FSD 규칙 포함)
{
  "extends": [
    "@feature-sliced"
  ],
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        {
          "target": "./src/shared",
          "from": "./src",
          "except": ["./shared"]
        },
        {
          "target": "./src/entities",
          "from": "./src",
          "except": ["./shared", "./entities"]
        },
        {
          "target": "./src/features",
          "from": "./src",
          "except": ["./shared", "./entities", "./features"]
        },
        {
          "target": "./src/widgets",
          "from": "./src",
          "except": ["./shared", "./entities", "./features", "./widgets"]
        },
        {
          "target": "./src/pages",
          "from": "./src",
          "except": ["./shared", "./entities", "./features", "./widgets", "./pages"]
        }
      ]
    }]
  }
}
```

---

## 🎓 팀 온보딩 가이드

### 새로운 팀원을 위한 FSD 퀵 스타트

#### 1. 기본 개념 (5분)
- FSD는 레이어 기반 아키텍처
- 하위 레이어만 import 가능 (단방향 의존성)
- 각 슬라이스는 독립적인 기능 단위

#### 2. 파일 위치 찾기 (3분)
```
Q: 새로운 기능을 추가하려면 어디에?
A: features/

Q: 데이터 모델을 정의하려면?
A: entities/[domain]/model/

Q: 공통 UI 컴포넌트는?
A: shared/ui/

Q: 페이지 컴포넌트는?
A: pages/[route]/
```

#### 3. 실습: 간단한 기능 추가 (10분)
```
Task: "이벤트 필터" 기능 추가

1. features/event-filter/ 생성
2. ui/EventFilter.tsx 작성 (UI)
3. model/useEventFilter.ts 작성 (로직)
4. index.ts 작성 (Public API)
5. pages/events/에서 사용

코드:
// features/event-filter/index.ts
export { EventFilter } from './ui/EventFilter'
export { useEventFilter } from './model/useEventFilter'

// pages/events/ui/EventsPage.tsx
import { EventFilter } from '@/features/event-filter'
```

#### 4. 체크리스트
- [ ] FSD 레이어 이해
- [ ] 의존성 규칙 숙지
- [ ] 네이밍 컨벤션 파악
- [ ] Public API 패턴 이해
- [ ] 첫 PR 제출 전 팀 리뷰 요청

---

## 📈 Progress Tracking Template

리팩터링 진행 상황을 추적하기 위한 템플릿:

### 주간 진행 리포트

**Week 1: [날짜]**

| Phase | Task | Status | 진행률 | 이슈 | 담당자 |
|-------|------|--------|--------|------|--------|
| 1 | pages/ 레이어 생성 | ✅ Done | 100% | - | @dev1 |
| 1 | store/ 마이그레이션 | 🔄 In Progress | 60% | 순환 의존성 1건 | @dev2 |
| 1 | 의존성 검증 | ⏸️ Pending | 0% | - | - |
| 2 | 네이밍 통일 | 📅 Planned | 0% | - | - |

**주요 성과**:
- pages/ 레이어 7개 슬라이스 생성 완료
- organizationStore 마이그레이션 완료

**발생한 이슈**:
- Issue #1: eventStore → memberStore 순환 의존성 발견
  - 해결 방법: shared/lib로 공통 함수 추출

**다음 주 계획**:
- store/ 마이그레이션 완료
- 레이어 의존성 전체 검증
- Phase 2 시작

---

## ✅ 최종 확인 사항

PRD 실행 전 마지막 체크:

- [ ] 팀 전체가 PRD 내용을 이해하고 동의했는가?
- [ ] 리팩터링 기간 동안 새 기능 개발이 중단되는가? (권장)
- [ ] Git 브랜치 전략이 수립되었는가?
- [ ] 롤백 계획이 준비되었는가?
- [ ] 테스트 환경이 준비되었는가?
- [ ] 백업이 완료되었는가?
- [ ] Cursor AI 등 도구 접근 권한이 있는가?
- [ ] 리팩터링 후 QA 일정이 확보되었는가?

---

## 📞 Support & Feedback

이 PRD에 대한 피드백이나 질문이 있으시면:

1. **GitHub Issues**: 기술적 질문, 버그 리포트
2. **GitHub Discussions**: 아키텍처 논의, 개선 제안
3. **Team Meeting**: 주간 진행 상황 공유

---

## 📄 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-12 | Frontend Team | 초안 작성 |

---

**END OF DOCUMENT**

이 PRD는 살아있는 문서입니다. 리팩터링 진행 중 발견되는 새로운 이슈나 개선사항을 지속적으로 업데이트하세요.
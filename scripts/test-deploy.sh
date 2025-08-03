#!/bin/bash

# 배포 테스트 스크립트
# 실제 배포 없이 빌드와 테스트만 실행

set -e

echo "🧪 배포 테스트 시작..."

# 프론트엔드 테스트
echo "📱 프론트엔드 테스트 중..."
cd frontend

echo "📦 의존성 설치..."
pnpm install

echo "🧪 테스트 실행..."
pnpm test

echo "🔨 빌드 테스트..."
pnpm run build

echo "✅ 프론트엔드 테스트 완료"
cd ..

# 백엔드 테스트
echo "🔧 백엔드 테스트 중..."
cd backend

echo "📦 의존성 설치..."
pnpm install

echo "🧪 테스트 실행..."
pnpm test

echo "🔨 빌드 테스트..."
pnpm run build

echo "✅ 백엔드 테스트 완료"
cd ..

echo "🎉 모든 배포 테스트가 성공적으로 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. GitHub 저장소에 push"
echo "2. Vercel과 Render에서 GitHub 연동"
echo "3. 환경변수 설정"
echo "4. 자동 배포 확인" 
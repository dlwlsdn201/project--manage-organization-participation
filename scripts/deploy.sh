#!/bin/bash

# 배포 스크립트
# 사용법: ./scripts/deploy.sh [frontend|backend|all]

set -e

echo "🚀 배포 스크립트 시작..."

# 환경 확인
if [ -z "$1" ]; then
    echo "사용법: $0 [frontend|backend|all]"
    exit 1
fi

DEPLOY_TYPE=$1

# 프론트엔드 배포
deploy_frontend() {
    echo "📱 프론트엔드 배포 시작..."
    
    cd frontend
    
    # 의존성 설치
    echo "📦 의존성 설치 중..."
    pnpm install
    
    # 테스트 실행
    echo "🧪 테스트 실행 중..."
    pnpm test
    
    # 빌드
    echo "🔨 빌드 중..."
    pnpm run build
    
    # Vercel 배포
    echo "🚀 Vercel에 배포 중..."
    if [ -n "$VERCEL_TOKEN" ]; then
        npx vercel --prod --token $VERCEL_TOKEN
    else
        echo "⚠️  VERCEL_TOKEN이 설정되지 않았습니다. 수동으로 배포해주세요."
        echo "   https://vercel.com에서 GitHub 저장소를 연결하여 배포하세요."
    fi
    
    cd ..
}

# 백엔드 배포
deploy_backend() {
    echo "🔧 백엔드 배포 시작..."
    
    cd backend
    
    # 의존성 설치
    echo "📦 의존성 설치 중..."
    pnpm install
    
    # 테스트 실행
    echo "🧪 테스트 실행 중..."
    pnpm test
    
    # 빌드
    echo "🔨 빌드 중..."
    pnpm run build
    
    # Render 배포
    echo "🚀 Render에 배포 중..."
    if [ -n "$RENDER_TOKEN" ] && [ -n "$RENDER_SERVICE_ID" ]; then
        curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_TOKEN" \
            -H "Content-Type: application/json"
        echo "✅ Render 배포 요청 완료"
    else
        echo "⚠️  RENDER_TOKEN 또는 RENDER_SERVICE_ID가 설정되지 않았습니다."
        echo "   https://render.com에서 GitHub 저장소를 연결하여 배포하세요."
    fi
    
    cd ..
}

# 전체 배포
deploy_all() {
    echo "🌐 전체 배포 시작..."
    deploy_backend
    echo "⏳ 백엔드 배포 완료 대기 중..."
    sleep 30
    deploy_frontend
}

# 배포 실행
case $DEPLOY_TYPE in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "all")
        deploy_all
        ;;
    *)
        echo "❌ 잘못된 배포 타입입니다. [frontend|backend|all] 중 선택하세요."
        exit 1
        ;;
esac

echo "✅ 배포 완료!" 
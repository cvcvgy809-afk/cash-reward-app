#!/bin/bash

# CashBox 웹 버전 빌드 스크립트

echo "🏗️  CashBox 웹 버전 빌드 시작..."

# 1. 기존 빌드 디렉터리 정리
echo "📦 기존 빌드 디렉터리 정리..."
rm -rf dist web-build

# 2. 웹 버전 빌드
echo "🔨 웹 버전 빌드 중..."
npx expo export --platform web

# 3. 빌드 결과 확인
if [ -d "dist" ]; then
    echo "✅ 웹 버전 빌드 완료!"
    echo "📂 빌드 디렉터리: $(pwd)/dist"
    echo ""
    echo "📝 다음 단계:"
    echo "1. dist 폴더의 모든 파일을 웹 서버에 업로드"
    echo "2. 또는 로컬에서 테스트: npx http-server dist"
    echo "3. Android WebView에서 해당 URL로 접속"
else
    echo "❌ 빌드 실패!"
    exit 1
fi

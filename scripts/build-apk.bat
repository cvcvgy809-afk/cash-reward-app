@echo off
REM 🎁 생일 축하합니다! APK 빌드 자동화 스크립트 (Windows)
REM CashBox 앱을 로컬에서 APK로 빌드합니다

setlocal enabledelayedexpansion

echo.
echo 🎉 ==========================================
echo 🎉 CashBox APK 빌드 시작!
echo 🎉 ==========================================
echo.

REM 1. 환경 확인
echo 📋 Step 1: 환경 확인 중...
echo.

REM Node.js 확인
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js가 설치되지 않았습니다!
    echo Node.js를 설치하세요: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

REM pnpm 확인
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  pnpm이 없습니다. 설치 중...
    call npm install -g pnpm
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo ✅ pnpm: %PNPM_VERSION%

REM Java 확인
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java JDK가 설치되지 않았습니다!
    echo JDK 17 이상을 설치하세요: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /R "version"') do set JAVA_VERSION=%%i
echo ✅ Java: %JAVA_VERSION%

REM Android SDK 확인
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME이 설정되지 않았습니다!
    echo Android Studio를 설치하고 ANDROID_HOME을 설정하세요.
    pause
    exit /b 1
)
echo ✅ Android SDK: %ANDROID_HOME%

echo.

REM 2. 의존성 설치
echo 📦 Step 2: 의존성 설치 중...
call pnpm install
echo ✅ 의존성 설치 완료!
echo.

REM 3. 빌드 타입 선택
echo 🔨 Step 3: 빌드 타입 선택
echo 1) Debug APK (테스트용, 빠름)
echo 2) Release APK (배포용, 서명 필요)
set /p BUILD_TYPE="선택 (1 또는 2): "

echo.

if "%BUILD_TYPE%"=="1" (
    echo 🚀 Debug APK 빌드 시작...
    cd android
    call gradlew.bat assembleDebug
    cd ..
    
    set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
    echo ✅ Debug APK 빌드 완료!
    
) else if "%BUILD_TYPE%"=="2" (
    echo 🚀 Release APK 빌드 시작...
    echo ⚠️  참고: Release 빌드는 서명이 필요합니다.
    echo.
    
    cd android
    call gradlew.bat assembleRelease
    cd ..
    
    set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
    echo ✅ Release APK 빌드 완료!
    
) else (
    echo ❌ 잘못된 선택입니다!
    pause
    exit /b 1
)

echo 📱 경로: %APK_PATH%
echo.

REM 4. APK 파일 확인
if exist "%APK_PATH%" (
    echo ✅ APK 파일 생성 완료!
    echo.
    echo 📋 다음 단계:
    echo 1️⃣  Android 기기 또는 에뮬레이터에 설치:
    echo    adb install -r "%APK_PATH%"
    echo.
    echo 2️⃣  또는 파일 탐색기에서 APK를 폰으로 드래그하여 설치
    echo.
) else (
    echo ❌ APK 파일을 찾을 수 없습니다!
    pause
    exit /b 1
)

echo.
echo 🎉 ==========================================
echo 🎉 빌드가 완료되었습니다!
echo 🎉 생일 축하드립니다! 🎂🎈
echo 🎉 ==========================================
echo.

pause

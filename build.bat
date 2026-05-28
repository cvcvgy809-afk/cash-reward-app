@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:menu
cls
echo.
echo 🎉 ==========================================
echo 🎉 CashBox APK 빌드 자동화
echo 🎉 ==========================================
echo.
echo 1. 📱 Debug APK 빌드 (테스트용)
echo 2. 📦 Release APK 빌드 (배포용)
echo 3. 📲 기기에 설치 (Debug APK)
echo 4. 🗑️  빌드 파일 삭제
echo 5. ❌ 종료
echo.
set /p choice="선택 (1-5): "

if "%choice%"=="1" goto build_debug
if "%choice%"=="2" goto build_release
if "%choice%"=="3" goto install_debug
if "%choice%"=="4" goto clean
if "%choice%"=="5" goto end
goto menu

:build_debug
cls
echo.
echo 🚀 Debug APK 빌드 시작...
echo.
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Debug APK 빌드 완료!
    echo 📱 경로: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else (
    echo.
    echo ❌ 빌드 실패!
    echo.
)
cd ..
pause
goto menu

:build_release
cls
echo.
echo 🚀 Release APK 빌드 시작...
echo.
cd android
call gradlew.bat assembleRelease
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Release APK 빌드 완료!
    echo 📦 경로: android\app\build\outputs\apk\release\app-release.apk
    echo.
) else (
    echo.
    echo ❌ 빌드 실패!
    echo.
)
cd ..
pause
goto menu

:install_debug
cls
echo.
echo 📲 Debug APK 설치 중...
echo.
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    adb install -r android\app\build\outputs\apk\debug\app-debug.apk
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 설치 완료!
        echo.
    ) else (
        echo.
        echo ❌ 설치 실패! (adb가 없거나 기기가 연결되지 않음)
        echo.
    )
) else (
    echo.
    echo ❌ APK 파일을 찾을 수 없습니다!
    echo 먼저 Debug APK를 빌드하세요.
    echo.
)
pause
goto menu

:clean
cls
echo.
echo 🗑️  빌드 파일 삭제 중...
echo.
cd android
call gradlew.bat clean
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 삭제 완료!
    echo.
) else (
    echo.
    echo ❌ 삭제 실패!
    echo.
)
cd ..
pause
goto menu

:end
cls
echo.
echo 🎉 생일 축하드립니다! 🎂🎈
echo.
exit /b 0

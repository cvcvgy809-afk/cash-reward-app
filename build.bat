@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:menu
cls
echo.
echo ==========================================
echo CashBox APK Build Automation
echo ==========================================
echo.
echo 1. Debug APK Build (for testing)
echo 2. Release APK Build (for distribution)
echo 3. Install to Device (Debug APK)
echo 4. Clean Build Files
echo 5. Exit
echo.
set /p choice="Select (1-5): "

if "%choice%"=="1" goto build_debug
if "%choice%"=="2" goto build_release
if "%choice%"=="3" goto install_debug
if "%choice%"=="4" goto clean
if "%choice%"=="5" goto end
goto menu

:build_debug
cls
echo.
echo Starting Debug APK build...
echo.
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Debug APK build completed!
    echo Path: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else (
    echo.
    echo [ERROR] Build failed!
    echo.
)
cd ..
pause
goto menu

:build_release
cls
echo.
echo Starting Release APK build...
echo.
cd android
call gradlew.bat assembleRelease
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Release APK build completed!
    echo Path: android\app\build\outputs\apk\release\app-release.apk
    echo.
) else (
    echo.
    echo [ERROR] Build failed!
    echo.
)
cd ..
pause
goto menu

:install_debug
cls
echo.
echo Installing Debug APK to device...
echo.
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    adb install -r android\app\build\outputs\apk\debug\app-debug.apk
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Installation completed!
        echo.
    ) else (
        echo.
        echo [ERROR] Installation failed! (adb not found or device not connected)
        echo.
    )
) else (
    echo.
    echo [ERROR] APK file not found!
    echo Please build Debug APK first.
    echo.
)
pause
goto menu

:clean
cls
echo.
echo Cleaning build files...
echo.
cd android
call gradlew.bat clean
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Cleanup completed!
    echo.
) else (
    echo.
    echo [ERROR] Cleanup failed!
    echo.
)
cd ..
pause
goto menu

:end
cls
echo.
echo Happy Birthday!
echo.
exit /b 0

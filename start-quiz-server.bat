@echo off
setlocal enabledelayedexpansion
title Voice Quiz Engine - Local Dev Server

echo =====================================================================
echo              VOICE QUIZ ENGINE - LAUNCHER ^& TESTER
echo =====================================================================
echo.

:: 1. Navigate to project root containing package.json
cd /d "%~dp0"
if not exist "package.json" (
    if exist "voice-quiz-engine\package.json" (
        cd /d "%~dp0voice-quiz-engine"
    ) else if exist "..\voice-quiz-engine\package.json" (
        cd /d "%~dp0..\voice-quiz-engine"
    )
)

if not exist "package.json" (
    echo [ERROR] Could not find voice-quiz-engine directory or package.json!
    echo Current folder: %CD%
    pause
    exit /b 1
)

:: 2. Check for node_modules
if not exist "node_modules\" (
    echo [WARN] node_modules not found. Installing dependencies first...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 3. Terminate any previous instances on port 5173 and 5174
echo [1/4] Closing any existing servers on ports 5173 / 5174...
set "KILLED_ANY=0"
for %%p in (5173 5174) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":%%p" ^| findstr "LISTENING"') do (
        echo       - Stopping lingering process PID %%a on port %%p...
        taskkill /F /PID %%a >nul 2>&1
        set "KILLED_ANY=1"
    )
)
if "!KILLED_ANY!"=="0" (
    echo       [OK] No stale servers running. Ports are clear.
) else (
    echo       [OK] Lingering servers closed successfully.
)
echo.

:: 4. Detect Local LAN IP Address
echo [2/4] Detecting your local LAN IP address...
set "LOCAL_IP="
for /f "tokens=4" %%a in ('route print 0.0.0.0 2^>nul ^| findstr "0.0.0.0"') do (
    if not defined LOCAL_IP (
        set "LOCAL_IP=%%a"
    )
)

if not defined LOCAL_IP (
    set "LOCAL_IP=localhost"
)

set "LOCAL_URL=http://localhost:5173/"
set "NETWORK_URL=http://%LOCAL_IP%:5173/"

:: 5. Copy Network URL to Windows Clipboard
echo | set /p="%NETWORK_URL%" | clip
echo       [OK] IP Address detected: %LOCAL_IP%
echo       [OK] Network URL copied to clipboard: %NETWORK_URL%
echo.

:: 6. Display Testing Banner
echo =====================================================================
echo   SERVER READY FOR TESTING!
echo.
echo     HOST PC BROWSER:
echo       %LOCAL_URL%
echo.
echo     MOBILE / TABLET / IPAD ON SAME WI-FI:
echo       %NETWORK_URL%
echo.
echo   [!] COPIED TO CLIPBOARD:
echo       The network link above is already in your clipboard.
echo       You can paste it directly into Messages, Slack, or email!
echo.
echo   [!] CRITICAL NOTE FOR MOBILE / TABLET VOICE TESTING:
echo       Modern mobile browsers (Chrome / Safari) require a Secure
echo       Context for microphone speech recognition over local networks:
echo.
echo       - iOS / Safari: Use Safari on iOS 15+ or Chrome on Desktop.
echo       - Android Chrome: Open "chrome://flags" and search for:
echo         "Insecure origins treated as secure"
echo         Add: %NETWORK_URL%  -^> Enable -^> Relaunch Chrome.
echo =====================================================================
echo.

:: 7. Launch Local Browser
echo [3/4] Launching default browser at %LOCAL_URL%...
start "" "%LOCAL_URL%"

:: 8. Start Vite Dev Server bound to 0.0.0.0:5173
echo [4/4] Starting latest Vite server on 0.0.0.0:5173...
echo.
call npm run dev -- --host 0.0.0.0 --port 5173

pause

@echo off
setlocal enabledelayedexpansion
title Office Manager

echo.
echo ==========================================
echo   OFFICE MANAGER - AUTO SETUP and START
echo ==========================================
echo.

:: 1. Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER%

:: 2. Install packages if needed
if not exist "node_modules" (
    echo [INFO] Installing packages, please wait...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [OK] Packages installed.
) else (
    echo [OK] node_modules found.
)

:: 3. Check .env.local
if not exist ".env.local" (
    echo [ERROR] .env.local not found.
    pause
    exit /b 1
)

:: If MONGODB_URI is still placeholder, ask user
findstr /c:"your-username" ".env.local" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo [WARN] MongoDB URI not set.
    echo     Format: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/office-manager
    echo.
    set /p MONGO_URI="  Paste MONGODB_URI: "
    if "!MONGO_URI!"=="" (
        echo [ERROR] No URI entered. Exiting.
        pause
        exit /b 1
    )
    powershell -Command "$content = Get-Content '.env.local' -Raw; $content = $content -replace 'MONGODB_URI=.*', 'MONGODB_URI=!MONGO_URI!'; Set-Content '.env.local' $content -Encoding UTF8 -NoNewline"
    echo [OK] MONGODB_URI saved.
)

:: 4. Seed database?
echo.
set /p DO_SEED="Seed sample data into database? (y/n): "
if /i "!DO_SEED!"=="y" (
    echo [INFO] Seeding...
    call npx ts-node --project tsconfig.seed.json scripts/seed.ts
    if %errorlevel% neq 0 (
        echo [WARN] Seed failed - check your MongoDB URI.
    ) else (
        echo [OK] Seed complete. Login: admin@company.com / admin1234
    )
)

:: 5. Clear port 3000
echo.
echo [INFO] Clearing port 3000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] Port 3000 ready.

:: 6. Open browser after 3s then start server
echo.
echo ==========================================
echo   http://localhost:3000
echo   Login: admin@company.com / admin1234
echo   Press Ctrl+C to stop.
echo ==========================================
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
call npm run dev

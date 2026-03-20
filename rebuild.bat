@echo off
echo Cleaning build artifacts...

REM Kill any running Node processes
taskkill /F /IM node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Try to remove .next folder
if exist .next (
    echo Removing .next folder...
    rmdir /s /q .next 2>nul
    if exist .next (
        echo Warning: Could not remove .next folder. Please close your IDE and try again.
        pause
        exit /b 1
    )
)

echo Installing dependencies...
call npm install --legacy-peer-deps

echo Building application...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo You can now run: npm start
) else (
    echo Build failed. Check the errors above.
)

pause

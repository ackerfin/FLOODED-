@echo off
cd /d "%~dp0"
start "" cmd /k "npm run serve:dashboard"
timeout /t 3 >nul
start "" "http://localhost:5050/rescue"


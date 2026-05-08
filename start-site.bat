@echo off
cd /d "%~dp0"
title Loviant Local Server
echo Starting Loviant Next.js at http://127.0.0.1:3000
echo Keep this window open while using the site.
echo.
start "" "http://127.0.0.1:3000"
npm run dev
pause

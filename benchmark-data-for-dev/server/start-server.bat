@echo off
echo Starting ESGSync Backend Server...
echo.
echo Make sure you have Node.js installed and dependencies installed.
echo Run: npm install (from project root)
echo.
echo Starting server on http://localhost:3010
echo.
cd /d "%~dp0.."
node server/server.js
pause

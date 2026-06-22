@echo off
echo.
echo === Pushing CLARE to GitHub ===
echo.

cd /d "%~dp0"

git init
git add .
git commit -m "Initial commit — CLARE Marketplace" 2>nul || git commit --allow-empty -m "Initial commit — CLARE Marketplace"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/romitghosh33-ops/clare.git
git push -u origin main

echo.
echo Done! Visit: https://github.com/romitghosh33-ops/clare
echo.
pause

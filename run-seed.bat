@echo off
title SmartSales AI - Data Seeder
echo ===================================================
echo    Seeding SmartSales AI Indian Enterprise Data...
echo ===================================================
echo.

cd /d %~dp0server
npm run seed

echo.
echo Data seeding complete!
pause

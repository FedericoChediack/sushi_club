@echo off
rem Doble click para ver el sitio: levanta un servidor local y abre el navegador.
title SushiClub
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Para ver el sitio hace falta Node.js. Descargalo de https://nodejs.org
  echo   ^(version LTS^), instalalo y volve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

node herramientas\servidor.js %*
pause

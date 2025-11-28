@echo off
REM Script para iniciar ambos servidores en Windows

echo.
echo ================================================================================
echo                         AMANWAL - STARTUP SCRIPT
echo ================================================================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js no esta instalado o no esta en el PATH
    echo Descargalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo [OK] Node.js %NODE_VERSION%
echo [OK] npm %NPM_VERSION%
echo.

REM Backend
echo ================================================================================
echo [SETUP] Backend
echo ================================================================================
cd backend
echo [INFO] Instalando dependencias del backend...
call npm install
echo.
echo [INFO] Iniciando servidor backend (puerto 3000)...
start "Amanwal Backend" cmd /k npm run dev
cd ..
timeout /t 3 /nobreak

REM Frontend
echo.
echo ================================================================================
echo [SETUP] Frontend
echo ================================================================================
cd frontend
echo [INFO] Instalando dependencias del frontend...
call npm install
echo.
echo [INFO] Iniciando servidor frontend (puerto 5173)...
start "Amanwal Frontend" cmd /k npm run dev
cd ..

echo.
echo ================================================================================
echo                          AMANWAL INICIADO
echo ================================================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Los servicios se abren en ventanas nuevas del comando.
echo Para detener todo, cierra ambas ventanas.
echo.
pause

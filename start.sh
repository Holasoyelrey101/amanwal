#!/bin/bash

# Script para iniciar ambos servidores en macOS/Linux

echo "🚀 Iniciando Amanwal..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# Backend
echo "🔧 Iniciando Backend..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo ""

# Frontend
echo "🎨 Iniciando Frontend..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏠 AMANWAL está listo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener los procesos activos
wait

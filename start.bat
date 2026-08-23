@echo off
echo Starting InternConnect...

:: Start the backend in a new window
start "InternConnect Backend" cmd /k "cd backend && npm install && npm start"

:: Start the frontend in a new window
start "InternConnect Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo Both frontend and backend are starting in separate windows!
echo Once Vite is ready, you can open http://localhost:5173/ in Chrome to test the login.
pause

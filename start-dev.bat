@echo off
echo Starting EshoTryStore Development Server...
echo.

rem Set environment variables for development
set DATABASE_URL=postgresql://test:test@localhost:5432/eshotry_dev
set SESSION_SECRET=dev-secret-key-32-characters-long
set REPLIT_DOMAINS=localhost:5000
set NODE_ENV=development
set OPENAI_API_KEY=your-openai-api-key-here
set PORT=5000

echo Environment variables set:
echo - DATABASE_URL: %DATABASE_URL%
echo - NODE_ENV: %NODE_ENV%
echo - Server will run on: http://localhost:5000
echo.

echo ⚠️  IMPORTANT: Replace 'your-openai-api-key-here' with your actual OpenAI API key
echo    Get your key from: https://platform.openai.com/api-keys
echo.

npm run dev

pause

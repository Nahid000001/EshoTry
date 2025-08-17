# EshoTryStore Environment Setup Script
# This script helps you create secure environment files

Write-Host "🔐 EshoTryStore Environment Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if .env.development already exists
if (Test-Path ".env.development") {
    Write-Host "⚠️  .env.development already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "📝 Creating .env.development file..." -ForegroundColor Cyan

# Create development environment file
$devEnv = @"
# Database Configuration
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/eshotry_dev"

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication & Security
SESSION_SECRET="your-super-secret-session-key-change-in-production-32-chars"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
REPLIT_DOMAINS="localhost:5000"

# AI Services
OPENAI_API_KEY="your-openai-api-key-here"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN="http://localhost:5173"
"@

$devEnv | Out-File -FilePath ".env.development" -Encoding UTF8

Write-Host "✅ .env.development created successfully!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to create production environment file
$createProd = Read-Host "Do you want to create .env.production template? (y/N)"
if ($createProd -eq "y" -or $createProd -eq "Y") {
    Write-Host "📝 Creating .env.production template..." -ForegroundColor Cyan
    
    $prodEnv = @"
# Database Configuration
DATABASE_URL="postgresql://prod_user:prod_password@your-db-host:5432/eshotry_prod"

# Server Configuration
PORT=5000
NODE_ENV=production

# Authentication & Security
SESSION_SECRET="your-production-session-secret-32-characters-long"
JWT_SECRET="your-production-jwt-secret-32-characters-long"
REPLIT_DOMAINS="your-domain.com"

# AI Services
OPENAI_API_KEY="your-production-openai-api-key"

# File Upload
UPLOAD_DIR="/var/www/eshotry/uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN="https://your-domain.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn-if-using"
"@

    $prodEnv | Out-File -FilePath ".env.production.template" -Encoding UTF8
    Write-Host "✅ .env.production.template created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔒 Security Reminders:" -ForegroundColor Yellow
Write-Host "  • Never commit .env files to version control" -ForegroundColor Yellow
Write-Host "  • Use different keys for development and production" -ForegroundColor Yellow
Write-Host "  • Rotate your API keys regularly" -ForegroundColor Yellow
Write-Host "  • Keep your keys secure and private" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env.development with your actual database credentials" -ForegroundColor White
Write-Host "  2. Update the session and JWT secrets with secure random strings" -ForegroundColor White
Write-Host "  3. Add your OpenAI API key from https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "  4. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to start development!" -ForegroundColor Green

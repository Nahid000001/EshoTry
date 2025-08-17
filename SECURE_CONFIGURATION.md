# 🔐 Secure Configuration Guide for EshoTryStore

## 🚨 **IMPORTANT: Never Commit API Keys to Version Control**

This guide shows you how to securely manage all your API keys and sensitive configuration.

## 📁 **Recommended File Structure**

```
EshoTryStore/
├── .env.development          # Development environment (NOT in git)
├── .env.production           # Production environment (NOT in git)
├── .env.development.template # Template for development (in git)
├── .env.production.template  # Template for production (in git)
├── keys/                     # Secure key storage (NOT in git)
│   ├── development/
│   │   ├── openai.key
│   │   ├── postgresql.key
│   │   └── session.key
│   └── production/
│       ├── openai.key
│       ├── postgresql.key
│       └── session.key
└── config/
    ├── development.json      # Non-sensitive dev config (in git)
    └── production.json       # Non-sensitive prod config (in git)
```

## 🔑 **API Keys You Need to Manage**

### **1. OpenAI API Key**
- **Purpose**: Chatbot, AI recommendations, virtual try-on
- **Get Your Key**: Visit https://platform.openai.com/api-keys
- **Storage**: `.env.development` and `.env.production`

### **2. PostgreSQL Database Key**
- **Purpose**: Database connection string
- **Format**: `postgresql://username:password@host:port/database`
- **Storage**: `.env.development` and `.env.production`

### **3. Session Secret**
- **Purpose**: Encrypting user sessions
- **Requirements**: 32+ characters, random
- **Storage**: `.env.development` and `.env.production`

### **4. JWT Secret**
- **Purpose**: Signing authentication tokens
- **Requirements**: 32+ characters, random
- **Storage**: `.env.development` and `.env.production`

## 🛠️ **Step-by-Step Setup**

### **Step 1: Create Development Environment File**

Create a file named `.env.development` in your project root:

```bash
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
```

### **Step 2: Create Production Environment File**

Create a file named `.env.production` in your project root:

```bash
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
```

## 🔒 **Security Best Practices**

### **1. Environment Variable Security**
- ✅ **Use `.env` files** for local development
- ✅ **Use environment variables** in production
- ✅ **Never commit `.env` files** to git
- ✅ **Use different keys** for development and production

### **2. Key Rotation**
- 🔄 **Rotate API keys** every 90 days
- 🔄 **Rotate session secrets** every 30 days
- 🔄 **Monitor key usage** for suspicious activity

### **3. Access Control**
- 🔐 **Limit key access** to necessary team members
- 🔐 **Use least privilege** principle
- 🔐 **Monitor key usage** logs

### **4. Production Security**
- 🛡️ **Use managed secrets** (AWS Secrets Manager, Azure Key Vault)
- 🛡️ **Encrypt secrets at rest**
- 🛡️ **Use secure key distribution**

## 🚀 **Quick Start Commands**

### **Development Setup**
```bash
# Create development environment file
cp env-template.txt .env.development
# Edit .env.development with your actual keys

# Start development server
npm run dev
```

### **Production Setup**
```bash
# Create production environment file
cp env-template.txt .env.production
# Edit .env.production with your actual keys

# Build and start production server
npm run build
npm start
```

## 🔍 **Verification Checklist**

Before deploying, ensure:

- [ ] All API keys are valid and have proper permissions
- [ ] Database connection string is correct
- [ ] Session secrets are 32+ characters and random
- [ ] CORS origins are properly configured
- [ ] Rate limiting is appropriate for your use case
- [ ] File upload directory exists and is writable
- [ ] Environment variables are loaded correctly

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"OPENAI_API_KEY not provided"**
   - Check that `.env.development` exists
   - Verify the key is correctly formatted
   - Ensure no extra spaces or quotes

2. **Database connection failed**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

3. **Session errors**
   - Verify SESSION_SECRET is 32+ characters
   - Check that session storage is accessible

## 📞 **Support**

If you need help with configuration:
1. Check the troubleshooting section above
2. Review the deployment documentation
3. Ensure all environment variables are properly set

---

**Remember**: Security is everyone's responsibility. Keep your keys safe! 🔐

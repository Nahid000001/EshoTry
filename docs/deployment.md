# EshoTry Deployment Guide

This comprehensive guide covers deploying EshoTry to production environments with full AI functionality, security, and performance optimization.

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 14 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended for AI features)
- **Storage**: 10GB available space
- **Network**: SSL certificate for HTTPS

### Required Services
- **Database**: PostgreSQL instance (Neon, AWS RDS, or self-hosted)
- **File Storage**: For user uploads and AI processing
- **Domain**: Registered domain with DNS control
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## Production Build

### 1. Build Application

```bash
# Clone repository
git clone <repository-url>
cd eshotry

# Install dependencies
npm ci --only=production

# Generate production build
node build-production.js
```

### 2. Build Artifacts

The build process creates:
- `dist/` - Production-ready application
- `dist/public/` - Static frontend assets
- `dist/index.js` - Bundled backend server
- `nginx.conf` - Web server configuration
- `Dockerfile` - Container configuration

## Environment Configuration

### 1. Production Environment Variables

Copy and configure the production environment template:

```bash
cp .env.production.template .env.production
```

**Required Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGUSER=production_user
PGPASSWORD=secure_password
PGDATABASE=eshotry_prod
PGHOST=your-db-host.com
PGPORT=5432

# Application Configuration
NODE_ENV=production
PORT=5000

# Security
SESSION_SECRET=your_super_secure_32_character_minimum_session_secret
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
REPL_ID=your_production_repl_id

# AI Configuration
TENSORFLOW_BACKEND=cpu
MAX_FILE_SIZE=10MB
UPLOAD_TIMEOUT=30000
```

### 2. Security Configuration

**Additional Security Variables:**
```env
# CORS and Security
CORS_ORIGIN=https://yourdomain.com
HELMET_CSP_ENABLED=true
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# SSL and HTTPS
FORCE_HTTPS=true
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
```

## Database Setup

### 1. Database Creation

Create production database:

```sql
-- Connect to PostgreSQL as admin
CREATE DATABASE eshotry_prod;
CREATE USER eshotry_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE eshotry_prod TO eshotry_user;

-- Enable required extensions
\c eshotry_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Schema Migration

Apply database schema:

```bash
# Set production database URL
export DATABASE_URL="postgresql://eshotry_user:secure_password@host:port/eshotry_prod"

# Apply migrations
npm run db:push

# Verify schema
npm run db:studio
```

### 3. Database Optimization

**Performance Tuning:**
```sql
-- Optimize PostgreSQL for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
```

## Deployment Options

### Option 1: Traditional Server Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash eshotry
sudo mkdir -p /var/www/eshotry
sudo chown eshotry:eshotry /var/www/eshotry
```

#### 2. Application Deployment

```bash
# Copy application files
sudo -u eshotry cp -r dist/* /var/www/eshotry/
sudo -u eshotry cp .env.production /var/www/eshotry/.env
sudo -u eshotry cp package*.json /var/www/eshotry/

# Install dependencies
cd /var/www/eshotry
sudo -u eshotry npm ci --only=production

# Start application with PM2
sudo -u eshotry pm2 start dist/index.js --name "eshotry"
sudo -u eshotry pm2 save
sudo -u eshotry pm2 startup
```

#### 3. Nginx Configuration

Install and configure Nginx:

```bash
sudo apt install nginx

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/eshotry
sudo ln -s /etc/nginx/sites-available/eshotry /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Option 2: Docker Deployment

#### 1. Build Docker Image

```bash
# Build production image
docker build -t eshotry:latest .

# Tag for registry (optional)
docker tag eshotry:latest your-registry/eshotry:latest
```

#### 2. Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: eshotry:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: eshotry_prod
      POSTGRES_USER: eshotry_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale application (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Option 3: Cloud Platform Deployment

#### Replit Deployment

1. **Configure Replit Deployment:**
   ```toml
   # .replit
   [deployment]
   run = ["sh", "-c", "npm run db:push && node dist/index.js"]
   
   [env]
   NODE_ENV = "production"
   ```

2. **Deploy via Replit Dashboard:**
   - Push code to Replit repository
   - Configure environment variables in Secrets
   - Enable Autoscale deployment
   - Configure custom domain

#### AWS/Azure/GCP Deployment

**AWS Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init eshotry

# Create environment
eb create production --database.engine postgres

# Deploy
eb deploy
```

## SSL/TLS Configuration

### 1. Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 2. Update Nginx for SSL

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Application proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### 1. Application Performance

**Enable Compression:**
```javascript
// In production server
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024
}));
```

**Database Connection Pooling:**
```javascript
// Optimize database connections
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. CDN Configuration

Configure CDN for static assets:

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
    access_log off;
}
```

### 3. AI Model Optimization

**TensorFlow Configuration:**
```javascript
// Optimize TensorFlow for production
import * as tf from '@tensorflow/tfjs-node';

// Configure backend
tf.env().set('WEBGL_CPU_FORWARD', false);
tf.env().set('WEBGL_PACK', true);

// Enable GPU if available
if (tf.getBackend() === 'tensorflow') {
  tf.enableProdMode();
}
```

## Monitoring and Logging

### 1. Application Monitoring

**PM2 Monitoring:**
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs eshotry

# Restart application
pm2 restart eshotry
```

**Health Check Endpoint:**
```javascript
// Add health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 2. Error Tracking

Configure error monitoring:
```javascript
// Add error tracking (example with Sentry)
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production'
  });
}
```

### 3. Performance Monitoring

**Database Monitoring:**
```sql
-- Monitor database performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Database Security

```sql
-- Secure database access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO eshotry_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO eshotry_user;

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

### 3. Application Security

**Rate Limiting:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Backup and Recovery

### 1. Database Backup

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="eshotry_prod"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/eshotry_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/eshotry_$DATE.sql

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: eshotry_$DATE.sql.gz"
```

**Schedule with Cron:**
```bash
# Add to crontab
0 2 * * * /path/to/backup-database.sh
```

### 2. Application Backup

```bash
#!/bin/bash
# backup-application.sh

APP_DIR="/var/www/eshotry"
BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)

# Create application backup
tar -czf $BACKUP_DIR/eshotry_app_$DATE.tar.gz -C $APP_DIR .

echo "Application backup completed: eshotry_app_$DATE.tar.gz"
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors:**
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Verify user permissions
psql $DATABASE_URL -c "\l"
```

**2. Memory Issues:**
```bash
# Monitor memory usage
free -h
htop

# Check Node.js memory
node --max-old-space-size=4096 dist/index.js
```

**3. SSL Certificate Issues:**
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443

# Check certificate expiry
certbot certificates
```

### Performance Debugging

**1. Slow Database Queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- View slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**2. High Memory Usage:**
```bash
# Analyze Node.js memory
node --inspect dist/index.js

# Use heap profiler
npm install -g clinic
clinic doctor -- node dist/index.js
```

## Deployment Checklist

Use this checklist to ensure successful deployment:

- [ ] **Environment Configuration**
  - [ ] Production environment variables set
  - [ ] Database credentials configured
  - [ ] SSL certificates installed
  - [ ] Domain DNS configured

- [ ] **Security**
  - [ ] HTTPS enforced
  - [ ] Firewall configured
  - [ ] Rate limiting enabled
  - [ ] Security headers set

- [ ] **Performance**
  - [ ] Static assets compressed
  - [ ] CDN configured
  - [ ] Database optimized
  - [ ] Caching enabled

- [ ] **Monitoring**
  - [ ] Health checks working
  - [ ] Error tracking configured
  - [ ] Performance monitoring enabled
  - [ ] Backup strategy implemented

- [ ] **Testing**
  - [ ] Load testing passed
  - [ ] Security testing completed
  - [ ] End-to-end testing verified
  - [ ] AI features functional

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure database connectivity and permissions
4. Review application logs for error details
5. Test SSL certificate and domain configuration

The production deployment should now be complete with all AI features functional and optimized for performance and security.
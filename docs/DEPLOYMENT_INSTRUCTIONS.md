# EshoTry AI Fashion Platform - Deployment Instructions

## Quick Start Production Deployment

### Prerequisites
- Docker 20.10+ and Docker Compose 2.0+
- PostgreSQL database (or use included container)
- Domain name with SSL certificate
- Environment variables configured

### 1-Minute Production Deployment

```bash
# Clone repository
git clone <repository-url>
cd eshotry-ai-platform

# Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
curl https://yourdomain.com/health
```

## Detailed Deployment Guide

### Step 1: Environment Preparation

#### Required Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/eshotry
POSTGRES_DB=eshotry
POSTGRES_USER=eshotry
POSTGRES_PASSWORD=your_secure_password

# Authentication
SESSION_SECRET=your_32_character_session_secret
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com

# AI Configuration
TENSORFLOW_BACKEND=cpu
MAX_CONCURRENT_PROCESSING=10
AI_MODEL_CACHE_SIZE=1GB

# Performance
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=2048
```

#### SSL Certificate Setup
```bash
# Place your SSL certificates in the ssl_certs directory
mkdir -p ssl_certs
cp your_domain.crt ssl_certs/server.crt
cp your_domain.key ssl_certs/server.key
chmod 600 ssl_certs/server.key
```

### Step 2: Production Deployment

#### Option A: Docker Compose (Recommended)
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app1=3 --scale app2=3

# Health check
curl https://yourdomain.com/health
```

#### Option B: Manual Deployment
```bash
# Build application
npm ci --production
npm run build

# Database setup
npm run db:push

# Start with PM2 (process manager)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

### Step 3: Load Balancer Configuration

#### Nginx Configuration
```nginx
upstream app_backend {
    least_conn;
    server app1:5000 max_fails=3 fail_timeout=30s;
    server app2:5000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    
    # API proxy
    location /api/ {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 4: Database Setup

#### PostgreSQL Initialization
```sql
-- Create database and user
CREATE DATABASE eshotry;
CREATE USER eshotry WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eshotry TO eshotry;

-- Create session storage table
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Run application migrations
-- This will be handled automatically by the application
```

### Step 5: Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'eshotry-app'
    static_configs:
      - targets: ['app1:5000', 'app2:5000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:8080']
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "EshoTry Performance",
    "panels": [
      {
        "title": "API Response Times",
        "targets": [
          {
            "expr": "avg(http_request_duration_seconds)",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "AI Processing Times",
        "targets": [
          {
            "expr": "avg(virtual_tryon_duration_seconds)",
            "legendFormat": "Virtual Try-On Processing"
          }
        ]
      }
    ]
  }
}
```

## Production Optimization

### Performance Tuning

#### Application Optimization
```javascript
// ecosystem.config.js for PM2
module.exports = {
  apps: [{
    name: 'eshotry-api',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=2048'
    }
  }]
};
```

#### Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
SELECT pg_reload_conf();

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_sessions_expire ON sessions(expire);
```

#### Redis Caching
```javascript
// Redis configuration
const redis = require('redis');
const client = redis.createClient({
  host: 'redis',
  port: 6379,
  maxmemory: '512mb',
  maxmemory_policy: 'allkeys-lru'
});

// Cache API responses
app.get('/api/products', cache('5 minutes'), async (req, res) => {
  // Product listing with caching
});
```

### Security Configuration

#### Security Headers
```javascript
// Express security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"]
    }
  }
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

#### SSL/TLS Configuration
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS
add_header Strict-Transport-Security "max-age=31536000" always;
```

## Scaling Strategy

### Horizontal Scaling

#### Application Scaling
```bash
# Scale with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --scale app1=5 --scale app2=5

# Scale with Kubernetes
kubectl scale deployment eshotry-app --replicas=10
```

#### Database Scaling
```yaml
# PostgreSQL read replicas
services:
  postgres-master:
    image: postgres:15
    environment:
      POSTGRES_REPLICATION_MODE: master
      
  postgres-replica:
    image: postgres:15
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_MASTER_SERVICE: postgres-master
```

### Auto-Scaling Configuration

#### CPU-based Auto-scaling
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eshotry-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eshotry-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="eshotry"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/eshotry_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/eshotry_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "eshotry_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/eshotry_$DATE.sql.gz s3://your-backup-bucket/
```

### Application Backup
```bash
#!/bin/bash
# backup-uploads.sh
rsync -av /app/uploads/ /backups/uploads/
tar -czf /backups/uploads_$(date +%Y%m%d).tar.gz /backups/uploads/
```

## Monitoring and Alerting

### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    ai_services: await checkAIServices(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  const healthy = Object.values(checks).every(check => 
    typeof check === 'object' ? check.status === 'ok' : check === true
  );
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  });
});
```

### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: eshotry.rules
  rules:
  - alert: HighResponseTime
    expr: avg(http_request_duration_seconds) > 1
    for: 5m
    annotations:
      summary: "High response time detected"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseConnectionIssue
    expr: up{job="postgres"} == 0
    for: 1m
    annotations:
      summary: "Database connection issue"
```

## Troubleshooting

### Common Deployment Issues

#### Container Startup Issues
```bash
# Check container logs
docker logs eshotry-app -f

# Check container status
docker ps -a

# Exec into container for debugging
docker exec -it eshotry-app /bin/sh
```

#### Database Connection Issues
```bash
# Test database connectivity
docker run --rm postgres:15 psql $DATABASE_URL -c "SELECT version();"

# Check database logs
docker logs eshotry-postgres -f
```

#### SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in ssl_certs/server.crt -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Performance Issues

#### High Memory Usage
```bash
# Monitor memory usage
docker stats

# Check for memory leaks
node --inspect dist/server/index.js
# Open chrome://inspect in Chrome
```

#### Slow Database Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks
```bash
# Update system packages
apt update && apt upgrade -y

# Clean Docker images
docker system prune -f

# Backup database
./scripts/backup-database.sh

# Check disk space
df -h
```

#### Monthly Tasks
```bash
# Update Node.js dependencies
npm audit fix

# Optimize database
VACUUM ANALYZE;

# Review and rotate logs
logrotate /etc/logrotate.conf

# Security audit
npm audit
```

### Updates and Upgrades

#### Application Updates
```bash
# Pull latest version
git pull origin main

# Build new version
docker-compose build

# Rolling update
docker-compose up -d --no-deps app1
# Wait for health check
docker-compose up -d --no-deps app2
```

#### Database Migrations
```bash
# Run migrations
npm run db:migrate

# Backup before major updates
./scripts/backup-database.sh

# Test migration on staging first
NODE_ENV=staging npm run db:migrate
```

---

*EshoTry AI Fashion Platform Deployment Instructions*  
*Production-Ready Deployment Guide*  
*Version 1.0 - June 25, 2025*
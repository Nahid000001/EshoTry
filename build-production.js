import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ProductionBuilder {
  constructor() {
    this.buildDir = 'dist';
    this.optimizations = {
      minification: true,
      compression: true,
      caching: true,
      bundleAnalysis: true
    };
  }

  log(message) {
    console.log(`[Build] ${message}`);
  }

  async cleanBuildDirectory() {
    this.log('Cleaning build directory...');
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.buildDir, { recursive: true });
  }

  async buildFrontend() {
    this.log('Building frontend assets...');
    
    // Update Vite config for production optimizations
    const viteConfigPath = 'vite.config.ts';
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (!viteConfig.includes('build: {')) {
      const optimizedConfig = viteConfig.replace(
        'export default defineConfig({',
        `export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          ai: ['@tensorflow/tfjs', '@mediapipe/pose']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },`
      );
      fs.writeFileSync(viteConfigPath, optimizedConfig);
      this.log('Vite config optimized for production');
    }

    try {
      execSync('npm run build', { stdio: 'inherit' });
      this.log('Frontend build completed successfully');
      
      // Generate build report
      this.generateBuildReport();
    } catch (error) {
      throw new Error(`Frontend build failed: ${error.message}`);
    }
  }

  async buildBackend() {
    this.log('Building backend bundle...');
    
    try {
      execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', { stdio: 'inherit' });
      this.log('Backend build completed successfully');
    } catch (error) {
      throw new Error(`Backend build failed: ${error.message}`);
    }
  }

  generateBuildReport() {
    this.log('Generating build report...');
    
    const distPath = path.join(process.cwd(), 'dist');
    const report = {
      buildTime: new Date().toISOString(),
      assets: [],
      totalSize: 0,
      chunks: []
    };

    if (fs.existsSync(distPath)) {
      const files = this.getAllFiles(distPath);
      
      files.forEach(file => {
        const stats = fs.statSync(file);
        const relativePath = path.relative(distPath, file);
        const size = stats.size;
        
        report.assets.push({
          path: relativePath,
          size: this.formatBytes(size),
          sizeBytes: size
        });
        
        report.totalSize += size;
      });
    }

    report.totalSizeFormatted = this.formatBytes(report.totalSize);
    
    fs.writeFileSync(
      path.join(distPath, 'build-report.json'), 
      JSON.stringify(report, null, 2)
    );
    
    this.log(`Build report generated. Total size: ${report.totalSizeFormatted}`);
  }

  getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateEnvironmentTemplate() {
    this.log('Generating environment templates...');
    
    const prodEnvTemplate = `# Production Environment Variables Template
# Copy this file to .env.production and fill in the values

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
PGHOST=your_db_host
PGPORT=5432

# Application Configuration
NODE_ENV=production
PORT=5000

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_minimum_32_characters_long

# Replit Auth (if using)
REPLIT_DOMAINS=your-domain.com,www.your-domain.com
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc

# AI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_if_needed
TENSORFLOW_BACKEND=cpu

# Security Headers
CORS_ORIGIN=https://your-domain.com
HELMET_CSP_ENABLED=true

# Performance Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info

# File Upload Limits
MAX_FILE_SIZE=10MB
UPLOAD_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;

    const devEnvTemplate = `# Development Environment Variables Template
# Copy this file to .env.development and fill in the values

# Database Configuration (Development)
DATABASE_URL=postgresql://username:password@localhost:5432/eshotry_dev
PGUSER=dev_user
PGPASSWORD=dev_password
PGDATABASE=eshotry_dev
PGHOST=localhost
PGPORT=5432

# Application Configuration
NODE_ENV=development
PORT=5000

# Session Configuration
SESSION_SECRET=development_session_secret_key_change_in_production

# Replit Auth (Development)
REPLIT_DOMAINS=localhost:5000,127.0.0.1:5000
REPL_ID=dev_repl_id

# Development Features
ENABLE_DEBUG=true
LOG_LEVEL=debug
HOT_RELOAD=true

# Performance Monitoring (Development)
ENABLE_METRICS=false
`;

    fs.writeFileSync('.env.production.template', prodEnvTemplate);
    fs.writeFileSync('.env.development.template', devEnvTemplate);
    
    this.log('Environment templates generated');
  }

  async optimizeAssets() {
    this.log('Optimizing production assets...');
    
    const distPublic = path.join('dist', 'public');
    if (!fs.existsSync(distPublic)) {
      this.log('No public assets to optimize');
      return;
    }

    // Add compression headers configuration
    const nginxConfig = `# Nginx configuration for EshoTry
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/eshotry/dist/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API proxy
    location /api/ {
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

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}`;

    fs.writeFileSync(path.join('dist', 'nginx.conf'), nginxConfig);
    this.log('Nginx configuration generated');

    // Generate Docker configuration
    const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]`;

    fs.writeFileSync('Dockerfile', dockerfile);
    this.log('Dockerfile generated');
  }

  async generateProductionChecklist() {
    this.log('Generating production deployment checklist...');
    
    const checklist = `# EshoTry Production Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured (.env.production)
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN setup (if applicable)
- [ ] Monitoring tools configured

## Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API keys secured
- [ ] Database access restricted

## Performance
- [ ] Static assets compressed
- [ ] Caching headers set
- [ ] Database connection pooling configured
- [ ] CDN configured for static assets
- [ ] Load balancer configured (if needed)

## Monitoring
- [ ] Application logs configured
- [ ] Error tracking setup
- [ ] Performance monitoring enabled
- [ ] Health checks working
- [ ] Backup strategy implemented

## AI Features
- [ ] TensorFlow models loaded
- [ ] Image processing working
- [ ] Recommendation engine active
- [ ] Virtual try-on functional
- [ ] File upload limits configured

## Testing
- [ ] Load testing passed
- [ ] Security testing passed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

## Post-Deployment
- [ ] Smoke tests passed
- [ ] Performance metrics baseline set
- [ ] Monitoring alerts configured
- [ ] Team access permissions set
- [ ] Documentation updated
`;

    fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
    this.log('Production checklist generated');
  }

  async createStartupScript() {
    this.log('Creating production startup script...');
    
    const startupScript = `#!/bin/bash
# EshoTry Production Startup Script

set -e

echo "Starting EshoTry Production Server..."

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo "Warning: NODE_ENV is not set to production"
fi

# Check required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET")
for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Run database migrations if needed
echo "Checking database..."
npm run db:push

# Start the application
echo "Starting application server..."
exec node dist/index.js
`;

    fs.writeFileSync('start-production.sh', startupScript);
    execSync('chmod +x start-production.sh');
    this.log('Production startup script created');
  }

  async build() {
    try {
      this.log('Starting production build process...');
      
      await this.cleanBuildDirectory();
      await this.buildFrontend();
      await this.buildBackend();
      await this.generateEnvironmentTemplate();
      await this.optimizeAssets();
      await this.generateProductionChecklist();
      await this.createStartupScript();
      
      this.log('Production build completed successfully!');
      this.log(`Build artifacts available in: ${this.buildDir}/`);
      
      // Display deployment instructions
      console.log('\n' + '='.repeat(60));
      console.log('DEPLOYMENT INSTRUCTIONS');
      console.log('='.repeat(60));
      console.log('1. Copy dist/ folder to your production server');
      console.log('2. Copy and configure .env.production.template');
      console.log('3. Install production dependencies: npm ci --only=production');
      console.log('4. Run database migrations: npm run db:push');
      console.log('5. Start the server: ./start-production.sh');
      console.log('6. Follow DEPLOYMENT_CHECKLIST.md for complete setup');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('Build failed:', error.message);
      process.exit(1);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new ProductionBuilder();
  builder.build().catch(console.error);
}

export default ProductionBuilder;
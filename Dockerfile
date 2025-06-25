# EshoTry AI Fashion Platform - Production Dockerfile
# Optimized for scalability and performance

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install production dependencies
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/temp /app/logs && \
    chown -R nodejs:nodejs /app

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# AI/ML optimizations
ENV TENSORFLOW_BACKEND=cpu
ENV MAX_CONCURRENT_PROCESSING=10
ENV IMAGE_PROCESSING_TIMEOUT=30000

# Performance optimizations
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV UV_THREADPOOL_SIZE=4

# Security headers
ENV HELMET_ENABLED=true
ENV RATE_LIMIT_ENABLED=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/server/index.js"]

# Production multi-stage with nginx reverse proxy
FROM nginx:alpine AS nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static assets from builder
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose nginx port
EXPOSE 80 443

# Labels for container metadata
LABEL name="eshotry-ai-platform" \
      version="1.0.0" \
      description="EshoTry AI Fashion Platform - Production Ready" \
      maintainer="EshoTry Team" \
      ai-features="virtual-tryon,3d-visualization,mobile-ar,recommendations,wardrobe-analysis"
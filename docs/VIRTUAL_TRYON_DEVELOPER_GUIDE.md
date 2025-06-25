# Virtual Try-On Developer Guide

## Overview

This guide provides comprehensive documentation for developers working with the EshoTry Virtual Try-On feature, including setup, API usage, customization, and troubleshooting.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- TensorFlow.js dependencies
- MediaPipe libraries

### Installation
```bash
npm install
npm run db:push
npm run dev
```

### Basic Usage
```typescript
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';

function ProductPage() {
  const { openVirtualTryOn } = useVirtualTryOn();
  
  const handleTryOn = () => {
    openVirtualTryOn({
      productId: 123,
      productImage: 'https://example.com/garment.jpg',
      garmentType: 'top'
    });
  };
}
```

## Architecture Overview

### Frontend Components

#### VirtualTryOnModal
```typescript
interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number;
  productImage?: string;
  garmentType?: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}
```

**Features:**
- Tabbed interface (Photo Upload / Avatar Creation)
- Responsive design with mobile optimization
- Accessibility compliance (WCAG 2.1 AA)
- Error handling with fallback options

#### VirtualTryOn Component
```typescript
interface VirtualTryOnProps {
  productId: number;
  productImage: string;
  garmentType: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}
```

**Capabilities:**
- Image upload with validation (10MB limit)
- Real-time processing feedback
- Privacy-conscious auto-deletion
- Graceful error handling

#### AvatarCreator Component
```typescript
interface BodyMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  armLength: number;
  inseam: number;
}
```

**Features:**
- Privacy-first virtual avatar creation
- Body measurement input validation
- Realistic garment fitting simulation
- No photos required

### Backend Architecture

#### Virtual Try-On Engine
```typescript
class VirtualTryOnEngine {
  async processVirtualTryOn(request: TryOnRequest): Promise<TryOnResult>
  async getSizeRecommendation(userId: string, productId: number): Promise<SizeRecommendation>
  async processBodyMeasurements(imageBuffer: Buffer): Promise<BodyAnalysis>
}
```

#### API Endpoints

##### POST /api/virtual-tryon
Process virtual try-on with body detection and garment overlay.

**Request:**
```json
{
  "userImage": "data:image/jpeg;base64,...",
  "garmentImage": "data:image/jpeg;base64,...",
  "garmentType": "top",
  "autoDelete": true
}
```

**Response:**
```json
{
  "resultImage": "data:image/jpeg;base64,...",
  "confidence": 0.89,
  "processingTime": 1847,
  "metadata": {
    "bodyDetected": true,
    "garmentFitScore": 0.92,
    "recommendations": ["Perfect fit!", "Great color match"]
  }
}
```

##### GET /api/size-recommendation/:productId
Get AI-powered size recommendations for a specific product.

**Response:**
```json
{
  "recommendedSize": "M",
  "confidence": 0.87,
  "alternatives": [
    { "size": "S", "confidence": 0.23 },
    { "size": "L", "confidence": 0.45 }
  ],
  "fitInsights": ["Based on your try-on history", "Recommended for athletic build"]
}
```

##### POST /api/body-measurements
Process body measurements from uploaded image.

**Request:**
```json
{
  "userImage": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "measurements": {
    "height": 175,
    "shoulders": 42,
    "chest": 38,
    "waist": 32,
    "hips": 40
  },
  "confidence": 0.94,
  "landmarks": [...],
  "bodyDetected": true
}
```

## State Management

### useVirtualTryOn Hook
```typescript
const {
  isOpen,          // Modal open state
  productId,       // Current product ID
  productImage,    // Product image URL
  garmentType,     // Type of garment
  openVirtualTryOn,  // Function to open modal
  closeVirtualTryOn  // Function to close modal
} = useVirtualTryOn();
```

### Usage Pattern
```typescript
// Open virtual try-on for specific product
const handleProductTryOn = (product: Product) => {
  openVirtualTryOn({
    productId: product.id,
    productImage: product.imageUrl,
    garmentType: determineGarmentType(product.category)
  });
};

// Determine garment type from product category
const determineGarmentType = (category: string): GarmentType => {
  const cat = category.toLowerCase();
  if (cat.includes('shirt') || cat.includes('top')) return 'top';
  if (cat.includes('pant') || cat.includes('jean')) return 'bottom';
  if (cat.includes('dress')) return 'dress';
  if (cat.includes('shoe')) return 'shoes';
  return 'accessories';
};
```

## Error Handling

### Graceful Fallbacks

#### Body Detection Failure
```typescript
// Automatic fallback to size recommendations
if (!bodyDetected) {
  const sizeRec = await getSizeRecommendation(userId, productId);
  showSizeRecommendation(sizeRec);
}
```

#### AI Service Unavailable
```typescript
// Circuit breaker pattern
try {
  const result = await processVirtualTryOn(request);
} catch (error) {
  if (error.code === 'SERVICE_UNAVAILABLE') {
    return fallbackToManualSizing();
  }
  throw error;
}
```

#### Network Issues
```typescript
// Timeout and retry logic
const response = await fetch('/api/virtual-tryon', {
  method: 'POST',
  timeout: 10000,
  retry: 3,
  retryDelay: 1000
});
```

### Error Categories

1. **User Input Errors**
   - Invalid image format
   - File size too large
   - Missing required fields

2. **Processing Errors**
   - Body detection failure
   - AI model unavailable
   - Insufficient image quality

3. **System Errors**
   - Network timeouts
   - Database connection issues
   - Memory limitations

## Performance Optimization

### Image Processing
```typescript
// Optimize image before processing
const optimizeImage = (imageData: string): string => {
  // Resize to maximum 1024x1024
  // Compress to 85% quality
  // Convert to JPEG if needed
  return optimizedImageData;
};
```

### Caching Strategy
```typescript
// Cache try-on results for 1 hour
const cacheKey = `tryon_${userId}_${productId}_${imageHash}`;
const cachedResult = await cache.get(cacheKey);
if (cachedResult) return cachedResult;
```

### Memory Management
```typescript
// Auto-cleanup for privacy
const processImage = async (imageData: string) => {
  try {
    const result = await virtualTryOnEngine.process(imageData);
    return result;
  } finally {
    // Clear image data from memory
    imageData = null;
    global.gc?.(); // Force garbage collection if available
  }
};
```

## Security & Privacy

### Data Handling
- User images are never stored permanently
- Automatic memory cleanup after processing
- No logging of sensitive image data
- GDPR-compliant data processing

### Privacy Controls
```typescript
// Privacy-conscious processing
const processVirtualTryOn = async (request: TryOnRequest) => {
  const result = await engine.process(request);
  
  // Auto-delete user image
  if (request.autoDelete) {
    delete request.userImage;
    console.log('User image auto-deleted for privacy');
  }
  
  return result;
};
```

## Testing

### Unit Tests
```typescript
describe('VirtualTryOn', () => {
  it('should handle image upload validation', () => {
    const largeFile = new File([''], 'large.jpg', { size: 15 * 1024 * 1024 });
    expect(() => validateImageUpload(largeFile)).toThrow('File too large');
  });
  
  it('should gracefully handle body detection failure', async () => {
    const result = await processWithFallback(invalidImage);
    expect(result.fallbackUsed).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('Virtual Try-On API', () => {
  it('should process valid try-on request', async () => {
    const response = await request(app)
      .post('/api/virtual-tryon')
      .send(validTryOnRequest)
      .expect(200);
      
    expect(response.body.resultImage).toBeDefined();
    expect(response.body.processingTime).toBeLessThan(2000);
  });
});
```

### Load Testing
```bash
# Run comprehensive load test
npm run test:load

# Run specific performance test
npm run test:performance
```

## Configuration

### Environment Variables
```bash
# AI Processing
TENSORFLOW_BACKEND=cpu
MEDIAPIPE_MODEL_PATH=/models/pose_landmarker.task

# Performance
MAX_CONCURRENT_PROCESSING=10
IMAGE_PROCESSING_TIMEOUT=30000

# Privacy
AUTO_DELETE_IMAGES=true
IMAGE_RETENTION_SECONDS=0
```

### Feature Flags
```typescript
const config = {
  virtualTryOn: {
    enabled: true,
    maxImageSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['jpeg', 'jpg', 'png'],
    processingTimeout: 30000,
    fallbackToSizing: true
  }
};
```

## Monitoring & Analytics

### Performance Metrics
```typescript
// Track processing times
const metrics = {
  tryOnSuccess: counter('virtual_tryon_success_total'),
  tryOnDuration: histogram('virtual_tryon_duration_seconds'),
  bodyDetectionRate: gauge('body_detection_success_rate'),
  errorRate: counter('virtual_tryon_errors_total')
};
```

### Error Tracking
```typescript
// Capture errors with context
const trackError = (error: Error, context: any) => {
  errorReporter.captureException(error, {
    tags: {
      feature: 'virtual-tryon',
      garmentType: context.garmentType,
      processingStage: context.stage
    },
    user: {
      id: context.userId
    }
  });
};
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] CDN setup for image delivery
- [ ] Database migrations applied
- [ ] Monitoring and alerting enabled
- [ ] Load balancer configured
- [ ] SSL certificates in place
- [ ] Privacy compliance verified

### Scaling Considerations
- Horizontal scaling for API servers
- GPU instances for AI processing
- Redis cluster for caching
- CDN for global image delivery
- Queue system for async processing

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Monitor memory usage
docker stats
# Implement memory limits
docker run --memory=2g your-app
```

#### Slow Processing Times
```bash
# Check AI model performance
npm run benchmark:ai
# Profile image processing
npm run profile:images
```

#### Body Detection Failures
```typescript
// Debug image quality
const analyzeImage = (imageData: string) => {
  const stats = getImageStats(imageData);
  console.log('Image quality metrics:', stats);
  return stats.quality > 0.7;
};
```

### Debug Mode
```typescript
// Enable debug logging
process.env.DEBUG = 'virtual-tryon:*';

// Verbose AI processing
const engine = new VirtualTryOnEngine({ debug: true });
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Add unit tests for new features
- Update documentation

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Run full test suite
5. Submit PR with detailed description

---

*Developer Guide for EshoTry Virtual Try-On Feature*  
*Version 1.0 - June 25, 2025*
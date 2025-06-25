# EshoTry API Reference

This document provides comprehensive documentation for the EshoTry API endpoints, including request/response formats, authentication requirements, and usage examples.

## Authentication

All protected endpoints require authentication via session cookies. Users must log in through the Replit Auth flow.

### Authentication Flow

1. **Login**: `GET /api/login` - Redirects to Replit Auth
2. **Callback**: `GET /api/callback` - Handles auth callback
3. **Logout**: `GET /api/logout` - Terminates session
4. **User Info**: `GET /api/auth/user` - Returns current user

## Product Management

### Get Products

```http
GET /api/products
```

**Query Parameters:**
- `categoryId` (optional) - Filter by category ID
- `search` (optional) - Search by product name/description
- `featured` (optional) - Show only featured products
- `limit` (optional) - Maximum number of results (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Classic White T-Shirt",
    "slug": "classic-white-t-shirt",
    "description": "Premium cotton t-shirt",
    "price": "29.99",
    "salePrice": "24.99",
    "brand": "EshoTry",
    "imageUrl": "https://example.com/image.jpg",
    "categoryId": 1,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["White", "Black"],
    "rating": 4.5,
    "stock": 100,
    "isFeatured": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### Get Product by ID

```http
GET /api/products/:id
```

**Response:** Single product object (same format as above)

### Get Categories

```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "T-Shirts",
    "slug": "t-shirts",
    "description": "Comfortable t-shirts for all occasions",
    "imageUrl": "https://example.com/category.jpg",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

## AI-Powered Features

### Get Personalized Recommendations

```http
GET /api/recommendations
```

**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Number of recommendations (default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Recommended Product",
    "price": "29.99",
    "imageUrl": "https://example.com/product.jpg",
    "confidence": 0.94,
    "reason": "Based on your browsing history"
  }
]
```

### Get Similar Products

```http
GET /api/products/:id/similar
```

**Query Parameters:**
- `limit` (optional) - Number of similar products (default: 4)

**Response:** Array of product objects with similarity scores

### Virtual Try-On

```http
POST /api/virtual-tryon
```

**Authentication:** Required

**Request Body:**
```json
{
  "userImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "garmentImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "garmentType": "top",
  "autoDelete": true
}
```

**Response:**
```json
{
  "resultImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "confidence": 0.89,
  "processingTime": 2100,
  "metadata": {
    "bodyDetected": true,
    "garmentFitScore": 0.85,
    "recommendations": [
      "This size fits well for your body type",
      "Consider sizing up for a looser fit"
    ]
  }
}
```

### Size Recommendations

```http
GET /api/size-recommendation/:productId
```

**Authentication:** Required

**Response:**
```json
{
  "recommendedSize": "M",
  "confidence": 0.89,
  "reasoning": [
    "Based on your body measurements",
    "Considering your fit preferences",
    "Analyzing similar product history"
  ],
  "alternativeSizes": [
    {
      "size": "L",
      "confidence": 0.65,
      "reason": "For a looser fit"
    }
  ]
}
```

### Outfit Recommendations

```http
GET /api/outfit-recommendations
```

**Authentication:** Required

**Query Parameters:**
- `productId` (optional) - Base product for outfit building
- `userId` (optional) - User ID for personalization

**Response:**
```json
[
  {
    "id": "casual-1",
    "name": "Casual Day Out",
    "products": {
      "top": { /* product object */ },
      "bottom": { /* product object */ },
      "accessories": [{ /* product objects */ }]
    },
    "compatibility": 0.92,
    "occasion": "Casual",
    "style": "Relaxed"
  }
]
```

## Shopping Cart

### Get Cart Items

```http
GET /api/cart
```

**Authentication:** Required

**Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "size": "M",
    "color": "White",
    "addedAt": "2025-01-01T00:00:00Z",
    "product": { /* product object */ }
  }
]
```

### Add to Cart

```http
POST /api/cart
```

**Authentication:** Required

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "size": "M",
  "color": "White"
}
```

**Response:** Created cart item object

### Update Cart Item

```http
PUT /api/cart/:id
```

**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** Updated cart item object

### Remove from Cart

```http
DELETE /api/cart/:id
```

**Authentication:** Required

**Response:** `204 No Content`

## Order Management

### Create Order

```http
POST /api/orders
```

**Authentication:** Required

**Request Body:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": "credit_card",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "size": "M",
      "color": "White"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "userId": "user-123",
  "status": "pending",
  "total": "59.98",
  "shippingAddress": { /* address object */ },
  "items": [{ /* order item objects */ }],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Get User Orders

```http
GET /api/orders
```

**Authentication:** Required

**Response:** Array of order objects

## Wishlist

### Get Wishlist

```http
GET /api/wishlist
```

**Authentication:** Required

**Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "addedAt": "2025-01-01T00:00:00Z",
    "product": { /* product object */ }
  }
]
```

### Add to Wishlist

```http
POST /api/wishlist
```

**Authentication:** Required

**Request Body:**
```json
{
  "productId": 1
}
```

**Response:** Created wishlist item

### Remove from Wishlist

```http
DELETE /api/wishlist/:productId
```

**Authentication:** Required

**Response:** `204 No Content`

## Admin Endpoints

### Get Analytics

```http
GET /api/admin/analytics
```

**Authentication:** Required (Admin)

**Response:**
```json
{
  "totalUsers": 1247,
  "activeUsers": 342,
  "totalOrders": 156,
  "revenue": 23456.78,
  "tryOnSessions": 89,
  "recommendationClicks": 445,
  "avgSessionTime": 8.5,
  "conversionRate": 12.5,
  "userGrowth": [
    { "month": "Jan", "users": 120 }
  ],
  "aiPerformance": [
    { "metric": "Recommendation Accuracy", "value": 94 }
  ]
}
```

### Get Product Performance

```http
GET /api/admin/product-performance
```

**Authentication:** Required (Admin)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Classic White T-Shirt",
    "views": 1234,
    "sales": 89,
    "tryOns": 45,
    "rating": 4.5,
    "revenue": 2667.11
  }
]
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Error Response Format

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **AI endpoints**: 50 requests per 15 minutes
- **Admin endpoints**: 200 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp

## Data Validation

All request bodies are validated using Zod schemas. Invalid requests return `400 Bad Request` with detailed validation errors.

### Example Validation Error

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Pagination

List endpoints support pagination with `limit` and `offset` parameters:

```http
GET /api/products?limit=20&offset=40
```

Pagination metadata is included in response headers:
- `X-Total-Count` - Total number of items
- `X-Page-Count` - Total number of pages
- `Link` - Navigation links (first, prev, next, last)
# Webinar Package Management System - API Documentation

A production-level Node.js + Express + MongoDB backend system for managing webinar packages and their purchases by institutes.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Features

✅ **Admin Package Management**
- Create, read, update, delete webinar packages
- Set pricing, discounts, and sale periods
- Manage package features and descriptions
- Soft delete support with audit trail

✅ **Institute Purchase System**
- Purchase webinar packages with payment tracking
- Track webinar usage and remaining balance
- Support for pending and completed payment statuses
- Expiry date management and expiration tracking

✅ **Webinar Usage Tracking**
- Decrement available webinars on usage
- Prevent usage if limit exceeded
- Calculate remaining and used webinar counts
- Usage percentage calculations

✅ **Role-Based Access Control**
- Admin: Full package management
- Institute: Purchase and manage own packages
- Secure role verification middleware

✅ **Production-Ready Features**
- Comprehensive validation and error handling
- Pagination and filtering support
- Soft delete with audit trail
- MongoDB aggregation for statistics
- Virtual fields for computed properties
- Index optimization for queries

## Architecture

```
├── models/
│   ├── WebinarPackage.js           # Package schema with validations
│   └── PurchasedWebinarPackage.js  # Purchase tracking schema
├── repository/
│   ├── webinar-package-repository.js
│   └── purchased-webinar-package-repository.js
├── services/
│   ├── webinar-package-service.js
│   └── purchased-webinar-package-service.js
├── controllers/
│   ├── webinar-package-controller.js
│   └── purchased-webinar-package-controller.js
├── middlewares/
│   └── role-based-auth.js          # Role-based authorization
└── routes/
    └── v1/index.js                 # Integrated routes
```

## Database Models

### WebinarPackage

Represents a webinar package offered by the platform.

```javascript
{
  _id: ObjectId,
  name: String (required, 3-100 chars),
  webinarCount: Number (required, 1-1000),
  originalPrice: Number (required),
  discountPrice: Number (optional),
  salePrice: Number (required),
  description: String (max 500 chars),
  features: [String],
  startDate: Date (required),
  endDate: Date (required),
  isActive: Boolean (default: true),
  createdBy: ObjectId (reference to User),
  deletedAt: Date (soft delete),
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual fields
  isSaleLive: Boolean // true if active and within date range
}
```

**Validations:**
- startDate must be before endDate
- salePrice cannot exceed originalPrice
- webinarCount between 1-1000
- All required fields must be provided

### PurchasedWebinarPackage

Represents a purchase of a webinar package by an institute.

```javascript
{
  _id: ObjectId,
  instituteId: ObjectId (required, reference to Institute),
  packageId: ObjectId (required, reference to WebinarPackage),
  webinarLimit: Number (required, 1+),
  usedWebinars: Number (default: 0),
  remainingWebinars: Number (auto-calculated),
  amountPaid: Number (required),
  paymentStatus: String (pending|completed|failed|refunded, default: pending),
  transactionId: String (optional),
  purchasedAt: Date (default: now),
  expiryDate: Date (required),
  isExpired: Boolean (auto-calculated),
  notes: String (max 500 chars),
  deletedAt: Date (soft delete),
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual fields
  usagePercentage: Number // (usedWebinars / webinarLimit) * 100
  isActive: Boolean // !isExpired && paymentStatus === 'completed' && expiryDate > now
}
```

**Validations:**
- remainingWebinars = webinarLimit - usedWebinars (auto-calculated)
- usedWebinars cannot exceed webinarLimit
- Automatically marked as expired if expiryDate is in the past

## API Endpoints

### WebinarPackage Management (Admin Only)

#### Create Package
```
POST /webinar-package
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Premium Webinar Package",
  "webinarCount": 50,
  "originalPrice": 10000,
  "discountPrice": 8000,
  "salePrice": 7500,
  "description": "Access to 50 exclusive webinars",
  "features": [
    "Live webinar access",
    "Recording access",
    "Certificate"
  ],
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}

Response: 201 Created
{
  "success": true,
  "message": "Webinar package created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Webinar Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "discountPrice": 8000,
    "salePrice": 7500,
    "isActive": true,
    "isSaleLive": true,
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Packages (with Filters)
```
GET /webinar-packages?page=1&limit=10&filters={"isActive":true}&sort={"createdAt":"desc"}

Response: 200 OK
{
  "success": true,
  "message": "Webinar packages fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Premium Webinar Package",
        "webinarCount": 50,
        "salePrice": 7500,
        "isSaleLive": true,
        ...
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

#### Get Active Packages
```
GET /webinar-packages/active

Response: 200 OK
{
  "success": true,
  "message": "Active webinar packages fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Webinar Package",
      "webinarCount": 50,
      "salePrice": 7500,
      "isSaleLive": true,
      ...
    }
  ]
}
```

#### Get Single Package
```
GET /webinar-package/{id}

Response: 200 OK
{
  "success": true,
  "message": "Webinar package fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Webinar Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "discountPrice": 8000,
    "salePrice": 7500,
    "description": "Access to 50 exclusive webinars",
    "features": ["Live webinar access", "Recording access", "Certificate"],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "isSaleLive": true,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "email": "admin@eduroutez.com"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Package
```
PATCH /webinar-package/{id}
Headers: Authorization: Bearer {token}

Request Body (all fields optional):
{
  "salePrice": 6500,
  "endDate": "2025-12-31T23:59:59Z",
  "isActive": false
}

Response: 200 OK
{
  "success": true,
  "message": "Webinar package updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "salePrice": 6500,
    "endDate": "2025-12-31T23:59:59Z",
    "isActive": false,
    ...
  }
}
```

#### Delete Package
```
DELETE /webinar-package/{id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Webinar package deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deletedAt": "2024-01-20T15:45:00Z",
    ...
  }
}
```

### Institute Purchase Operations

#### Purchase Package
```
POST /webinar-package/purchase
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "packageId": "507f1f77bcf86cd799439011",
  "amountPaid": 7500,
  "expiryDate": "2024-12-31T23:59:59Z",
  "paymentStatus": "pending",
  "transactionId": "TXN123456789",
  "notes": "First bulk purchase"
}

Response: 201 Created
{
  "success": true,
  "message": "Webinar package purchased successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "instituteId": "507f1f77bcf86cd799439015",
    "packageId": "507f1f77bcf86cd799439011",
    "webinarLimit": 50,
    "usedWebinars": 0,
    "remainingWebinars": 50,
    "amountPaid": 7500,
    "paymentStatus": "pending",
    "transactionId": "TXN123456789",
    "purchasedAt": "2024-01-15T10:30:00Z",
    "expiryDate": "2024-12-31T23:59:59Z",
    "isExpired": false,
    "usagePercentage": 0,
    "isActive": false
  }
}
```

#### Get My Purchases
```
GET /my-webinar-purchases?page=1&limit=10&onlyActive=true
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Your purchases fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "packageId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Premium Webinar Package",
          "webinarCount": 50
        },
        "webinarLimit": 50,
        "usedWebinars": 5,
        "remainingWebinars": 45,
        "paymentStatus": "completed",
        "expiryDate": "2024-12-31T23:59:59Z",
        "isExpired": false,
        "usagePercentage": 10,
        "isActive": true,
        ...
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Use Webinar
```
POST /webinar-purchase/{purchaseId}/use-webinar
Headers: Authorization: Bearer {token}

Request Body:
{
  "count": 1
}

Response: 200 OK
{
  "success": true,
  "message": "1 webinar(s) used successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "usedWebinars": 6,
    "remainingWebinars": 44,
    "usagePercentage": 12,
    ...
  }
}
```

#### Confirm Payment
```
POST /webinar-purchase/{purchaseId}/confirm-payment
Headers: Authorization: Bearer {token}

Request Body:
{
  "transactionId": "TXN987654321"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "paymentStatus": "completed",
    "transactionId": "TXN987654321",
    "isActive": true,
    ...
  }
}
```

#### Check Webinar Availability
```
POST /webinar-purchase/check-availability
Headers: Authorization: Bearer {token}

Request Body:
{
  "packageId": "507f1f77bcf86cd799439011"
}

Response: 200 OK
{
  "success": true,
  "message": "Webinars available",
  "data": {
    "available": true
  }
}
```

#### Get Purchase Details
```
GET /webinar-purchase/{id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Purchase details fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "instituteId": {
      "_id": "507f1f77bcf86cd799439015",
      "instituteName": "ABC Institute"
    },
    "packageId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Webinar Package"
    },
    "webinarLimit": 50,
    "usedWebinars": 5,
    "remainingWebinars": 45,
    "amountPaid": 7500,
    "paymentStatus": "completed",
    "transactionId": "TXN987654321",
    "purchasedAt": "2024-01-15T10:30:00Z",
    "expiryDate": "2024-12-31T23:59:59Z",
    "isExpired": false,
    "usagePercentage": 10,
    "isActive": true,
    ...
  }
}
```

#### Get All Purchases (Admin Only)
```
GET /webinar-purchases?page=1&limit=10&filters={"paymentStatus":"completed"}&sort={"purchasedAt":"desc"}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Purchases fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "instituteId": {...},
        "packageId": {...},
        "webinarLimit": 50,
        ...
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

#### Get Purchase Statistics (Admin Only)
```
GET /webinar-purchases/stats?filters={}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Purchase statistics fetched successfully",
  "data": [
    {
      "_id": "completed",
      "count": 150,
      "totalAmount": 1125000
    },
    {
      "_id": "pending",
      "count": 25,
      "totalAmount": 187500
    },
    {
      "_id": "failed",
      "count": 10,
      "totalAmount": 75000
    }
  ]
}
```

## Authentication & Authorization

### Required Headers
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Role-Based Access Control

| Endpoint | Admin | Institute | Public |
|----------|-------|-----------|--------|
| POST /webinar-package | ✅ | ❌ | ❌ |
| PATCH /webinar-package/:id | ✅ | ❌ | ❌ |
| DELETE /webinar-package/:id | ✅ | ❌ | ❌ |
| GET /webinar-packages | ✅ | ✅ | ✅ |
| GET /webinar-packages/active | ✅ | ✅ | ✅ |
| GET /webinar-package/:id | ✅ | ✅ | ✅ |
| POST /webinar-package/purchase | ❌ | ✅ | ❌ |
| GET /my-webinar-purchases | ❌ | ✅ | ❌ |
| POST /webinar-purchase/:id/use-webinar | ❌ | ✅ | ❌ |
| GET /webinar-purchases | ✅ | ❌ | ❌ |
| GET /webinar-purchases/stats | ✅ | ❌ | ❌ |

### Middleware Chain

```javascript
// Standard Authentication
accessTokenAutoRefresh -> passport.authenticate("jwt") -> next()

// Admin Operations
...authenticate -> requireAdmin -> controller

// Institute Operations
...authenticate -> requireInstitute -> controller

// Ownership Verification
...authenticate -> verifyOwnershipOrAdmin("paramKey") -> controller
```

## Error Handling

The API implements centralized error handling with standard HTTP status codes.

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": {},
  "error": {
    "statusCode": 400,
    "message": "Detailed error message",
    "explanation": "Error explanation"
  }
}
```

### Common Error Codes

| Code | Scenario | Message |
|------|----------|---------|
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Unexpected server error |

### Example Errors

#### Missing Required Field
```json
{
  "success": false,
  "message": "Required fields: name, webinarCount, salePrice, startDate, endDate",
  "error": {
    "statusCode": 400,
    "message": "Required fields: name, webinarCount, salePrice, startDate, endDate"
  }
}
```

#### Invalid Date Range
```json
{
  "success": false,
  "message": "Start date must be before end date",
  "error": {
    "statusCode": 400,
    "message": "Start date must be before end date"
  }
}
```

#### Insufficient Webinars
```json
{
  "success": false,
  "message": "Insufficient webinars. Only 5 remaining",
  "error": {
    "statusCode": 400,
    "message": "Insufficient webinars. Only 5 remaining"
  }
}
```

#### Unauthorized Access
```json
{
  "success": false,
  "message": "Forbidden: Only admins can perform this action",
  "error": {
    "statusCode": 403,
    "message": "Forbidden: Only admins can perform this action"
  }
}
```

## Examples

### Admin Workflow: Creating and Managing Packages

```bash
# 1. Create a new package
curl -X POST http://localhost:3000/api/v1/webinar-package \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elite Webinar Package",
    "webinarCount": 100,
    "originalPrice": 20000,
    "discountPrice": 16000,
    "salePrice": 15000,
    "description": "100 premium webinars",
    "features": ["Live access", "Recordings", "Certificates", "Q&A"],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'

# 2. Get all packages
curl -X GET "http://localhost:3000/api/v1/webinar-packages?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 3. Update package pricing
curl -X PATCH http://localhost:3000/api/v1/webinar-package/{package_id} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salePrice": 14000
  }'

# 4. View purchase statistics
curl -X GET "http://localhost:3000/api/v1/webinar-purchases/stats" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Institute Workflow: Purchasing and Using Webinars

```bash
# 1. View available packages
curl -X GET "http://localhost:3000/api/v1/webinar-packages/active" \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN"

# 2. Purchase a package
curl -X POST http://localhost:3000/api/v1/webinar-package/purchase \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "507f1f77bcf86cd799439011",
    "amountPaid": 15000,
    "expiryDate": "2024-12-31T23:59:59Z",
    "paymentStatus": "pending",
    "notes": "Payment via Razorpay"
  }'

# 3. Confirm payment after payment gateway response
curl -X POST http://localhost:3000/api/v1/webinar-purchase/{purchase_id}/confirm-payment \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "razorpay_TXN_12345"
  }'

# 4. Check availability before using webinar
curl -X POST http://localhost:3000/api/v1/webinar-purchase/check-availability \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "507f1f77bcf86cd799439011"
  }'

# 5. Use a webinar
curl -X POST http://localhost:3000/api/v1/webinar-purchase/{purchase_id}/use-webinar \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1
  }'

# 6. View my purchases
curl -X GET "http://localhost:3000/api/v1/my-webinar-purchases?page=1&limit=10&onlyActive=true" \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN"

# 7. Get detailed purchase information
curl -X GET http://localhost:3000/api/v1/webinar-purchase/{purchase_id} \
  -H "Authorization: Bearer YOUR_INSTITUTE_TOKEN"
```

## Integration with Payment Gateway

When integrating with Razorpay or other payment gateways:

1. **Create Purchase** - Initially set `paymentStatus` to "pending"
2. **Handle Payment** - Process payment through gateway
3. **Confirm Payment** - Call confirm-payment endpoint with transaction ID from gateway
4. **Automatic Activation** - Purchase becomes active when payment is confirmed

```javascript
// Pseudo-code for integration
const purchase = await purchaseWebinarPackage({
  packageId: "...",
  amountPaid: 15000,
  expiryDate: "...",
  paymentStatus: "pending" // Initially pending
});

// After successful payment from Razorpay
await confirmPayment(purchase._id, razorpayTransactionId);

// Now purchase.isActive === true (if not expired)
// Institute can use webinars
```

## Performance Considerations

- ✅ Database indexes on frequently queried fields
- ✅ Virtual fields for computed properties (no extra storage)
- ✅ Pagination support for large datasets
- ✅ Soft delete to maintain data integrity
- ✅ Efficient aggregation for statistics
- ✅ Transaction ID unique constraint for payment tracking

## Security Best Practices

- ✅ Role-based access control on all endpoints
- ✅ Input validation on all fields
- ✅ JWT token requirement for protected endpoints
- ✅ Ownership verification for institute data
- ✅ No sensitive data in response bodies
- ✅ Soft delete instead of hard delete for audit trail

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Maintainer:** Eduroutez Backend Team

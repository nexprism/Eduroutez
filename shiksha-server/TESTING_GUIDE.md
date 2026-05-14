# Webinar Package Management System - Testing Guide

Complete testing guide with curl commands and expected responses.

## Table of Contents

- [Setup](#setup)
- [Test Data](#test-data)
- [Admin Operations](#admin-operations)
- [Institute Operations](#institute-operations)
- [Error Scenarios](#error-scenarios)

## Setup

### Environment Variables

```bash
# .env or terminal variables
API_BASE_URL=http://localhost:5000/api/v1
ADMIN_TOKEN=your_admin_jwt_token_here
INSTITUTE_TOKEN=your_institute_jwt_token_here
```

### Sample Tokens

For testing, use tokens with these payloads:

**Admin Token:**
```json
{
  "_id": "507f1f77bcf86cd799439001",
  "email": "admin@eduroutez.com",
  "role": "admin",
  "iat": 1705315800,
  "exp": 1705402200
}
```

**Institute Token:**
```json
{
  "_id": "507f1f77bcf86cd799439002",
  "email": "institute@example.com",
  "role": "institute",
  "instituteName": "ABC Institute",
  "iat": 1705315800,
  "exp": 1705402200
}
```

## Test Data

### Package ID (for examples)
```
507f1f77bcf86cd799439011
```

### Purchase ID (for examples)
```
507f1f77bcf86cd799439020
```

### Institute ID (for examples)
```
507f1f77bcf86cd799439002
```

## Admin Operations

### 1. Create Webinar Package

**Endpoint:** `POST /webinar-package`

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Webinar Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "discountPrice": 8000,
    "salePrice": 7500,
    "description": "Access to 50 premium webinars with recordings",
    "features": [
      "Live webinar access",
      "Recording access",
      "Certificate of completion",
      "Q&A session access",
      "Resource materials"
    ],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response (201):**
```json
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
    "description": "Access to 50 premium webinars with recordings",
    "features": [
      "Live webinar access",
      "Recording access",
      "Certificate of completion",
      "Q&A session access",
      "Resource materials"
    ],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "createdBy": "507f1f77bcf86cd799439001",
    "isSaleLive": true,
    "createdAt": "2024-01-15T10:30:00.123Z",
    "updatedAt": "2024-01-15T10:30:00.123Z"
  }
}
```

### 2. Get Single Package

**Endpoint:** `GET /webinar-package/{id}`

**Command:**
```bash
curl -X GET http://localhost:5000/api/v1/webinar-package/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Webinar package fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Webinar Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "salePrice": 7500,
    "isActive": true,
    "isSaleLive": true,
    "createdAt": "2024-01-15T10:30:00.123Z"
  }
}
```

### 3. Get All Packages

**Endpoint:** `GET /webinar-packages`

**Command - Basic:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-packages" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Command - With Pagination:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-packages?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Command - With Filters:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-packages?filters={\"isActive\":true}&sort={\"createdAt\":-1}" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
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
        "isActive": true,
        "isSaleLive": true
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Standard Webinar Package",
        "webinarCount": 25,
        "salePrice": 3500,
        "isActive": true,
        "isSaleLive": false
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### 4. Get Active Packages

**Endpoint:** `GET /webinar-packages/active`

**Command:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-packages/active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Active webinar packages fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Webinar Package",
      "webinarCount": 50,
      "salePrice": 7500,
      "isSaleLive": true
    }
  ]
}
```

### 5. Update Package

**Endpoint:** `PATCH /webinar-package/{id}`

**Command:**
```bash
curl -X PATCH http://localhost:5000/api/v1/webinar-package/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salePrice": 6500,
    "discountPrice": 7000,
    "endDate": "2025-12-31T23:59:59Z"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Webinar package updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Webinar Package",
    "salePrice": 6500,
    "discountPrice": 7000,
    "endDate": "2025-12-31T23:59:59Z",
    "updatedAt": "2024-01-15T11:00:00.123Z"
  }
}
```

### 6. Delete Package

**Endpoint:** `DELETE /webinar-package/{id}`

**Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/webinar-package/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Webinar package deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Webinar Package",
    "deletedAt": "2024-01-15T11:30:00.123Z"
  }
}
```

### 7. Get Purchase Statistics (Admin)

**Endpoint:** `GET /webinar-purchases/stats`

**Command:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-purchases/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Purchase statistics fetched successfully",
  "data": [
    {
      "_id": "completed",
      "count": 25,
      "totalAmount": 187500
    },
    {
      "_id": "pending",
      "count": 10,
      "totalAmount": 75000
    },
    {
      "_id": "failed",
      "count": 5,
      "totalAmount": 37500
    }
  ]
}
```

### 8. Get All Purchases (Admin)

**Endpoint:** `GET /webinar-purchases`

**Command:**
```bash
curl -X GET "http://localhost:5000/api/v1/webinar-purchases?page=1&limit=10&filters={\"paymentStatus\":\"completed\"}&sort={\"purchasedAt\":-1}" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Purchases fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "instituteId": {
          "_id": "507f1f77bcf86cd799439002",
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
        "usagePercentage": 10,
        "isActive": true,
        "purchasedAt": "2024-01-15T10:30:00.123Z"
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

## Institute Operations

### 1. Purchase Webinar Package

**Endpoint:** `POST /webinar-package/purchase`

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package/purchase \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "507f1f77bcf86cd799439011",
    "amountPaid": 7500,
    "expiryDate": "2024-12-31T23:59:59Z",
    "paymentStatus": "pending",
    "transactionId": "razorpay_order_123456",
    "notes": "Bulk purchase for summer semester"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Webinar package purchased successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "instituteId": "507f1f77bcf86cd799439002",
    "packageId": "507f1f77bcf86cd799439011",
    "webinarLimit": 50,
    "usedWebinars": 0,
    "remainingWebinars": 50,
    "amountPaid": 7500,
    "paymentStatus": "pending",
    "transactionId": "razorpay_order_123456",
    "purchasedAt": "2024-01-15T10:30:00.123Z",
    "expiryDate": "2024-12-31T23:59:59Z",
    "isExpired": false,
    "usagePercentage": 0,
    "isActive": false,
    "notes": "Bulk purchase for summer semester",
    "createdAt": "2024-01-15T10:30:00.123Z"
  }
}
```

### 2. Get My Purchases

**Endpoint:** `GET /my-webinar-purchases`

**Command - All Purchases:**
```bash
curl -X GET "http://localhost:5000/api/v1/my-webinar-purchases?page=1&limit=10" \
  -H "Authorization: Bearer $INSTITUTE_TOKEN"
```

**Command - Only Active:**
```bash
curl -X GET "http://localhost:5000/api/v1/my-webinar-purchases?onlyActive=true" \
  -H "Authorization: Bearer $INSTITUTE_TOKEN"
```

**Expected Response (200):**
```json
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
        "amountPaid": 7500,
        "paymentStatus": "completed",
        "transactionId": "razorpay_pay_123456",
        "purchasedAt": "2024-01-15T10:30:00.123Z",
        "expiryDate": "2024-12-31T23:59:59Z",
        "isExpired": false,
        "usagePercentage": 10,
        "isActive": true
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

### 3. Confirm Payment

**Endpoint:** `POST /webinar-purchase/{purchaseId}/confirm-payment`

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/confirm-payment \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "razorpay_pay_ABC123XYZ"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "paymentStatus": "completed",
    "transactionId": "razorpay_pay_ABC123XYZ",
    "isActive": true,
    "usagePercentage": 0,
    "updatedAt": "2024-01-15T11:00:00.123Z"
  }
}
```

### 4. Use Webinar

**Endpoint:** `POST /webinar-purchase/{purchaseId}/use-webinar`

**Command - Use 1 Webinar:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/use-webinar \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1
  }'
```

**Command - Use 5 Webinars:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/use-webinar \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 5
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "1 webinar(s) used successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "usedWebinars": 6,
    "remainingWebinars": 44,
    "usagePercentage": 12,
    "updatedAt": "2024-01-15T11:05:00.123Z"
  }
}
```

### 5. Check Webinar Availability

**Endpoint:** `POST /webinar-purchase/check-availability`

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/check-availability \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "507f1f77bcf86cd799439011"
  }'
```

**Expected Response (200) - Available:**
```json
{
  "success": true,
  "message": "Webinars available",
  "data": {
    "available": true
  }
}
```

**Expected Response (200) - Not Available:**
```json
{
  "success": true,
  "message": "No webinars available",
  "data": {
    "available": false
  }
}
```

### 6. Get Purchase Details

**Endpoint:** `GET /webinar-purchase/{id}`

**Command:**
```bash
curl -X GET http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer $INSTITUTE_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Purchase details fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "instituteId": {
      "_id": "507f1f77bcf86cd799439002",
      "instituteName": "ABC Institute"
    },
    "packageId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Webinar Package",
      "webinarCount": 50,
      "originalPrice": 10000,
      "salePrice": 7500
    },
    "webinarLimit": 50,
    "usedWebinars": 6,
    "remainingWebinars": 44,
    "amountPaid": 7500,
    "paymentStatus": "completed",
    "transactionId": "razorpay_pay_ABC123XYZ",
    "purchasedAt": "2024-01-15T10:30:00.123Z",
    "expiryDate": "2024-12-31T23:59:59Z",
    "isExpired": false,
    "usagePercentage": 12,
    "isActive": true,
    "notes": "Bulk purchase for summer semester",
    "createdAt": "2024-01-15T10:30:00.123Z",
    "updatedAt": "2024-01-15T11:05:00.123Z"
  }
}
```

## Error Scenarios

### 1. Missing Required Fields

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Package"
  }'
```

**Expected Response (400):**
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

### 2. Invalid Date Range

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "salePrice": 7500,
    "startDate": "2024-12-31T23:59:59Z",
    "endDate": "2024-06-01T00:00:00Z"
  }'
```

**Expected Response (400):**
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

### 3. Unauthorized Access (No Token)

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "salePrice": 7500,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorised access no token"
}
```

### 4. Forbidden Access (Wrong Role)

**Command (Institute trying to create package):**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "salePrice": 7500,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response (403):**
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

### 5. Insufficient Webinars

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/use-webinar \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100
  }'
```

**Expected Response (400) - After using 44 webinars:**
```json
{
  "success": false,
  "message": "Insufficient webinars. Only 6 remaining",
  "error": {
    "statusCode": 400,
    "message": "Insufficient webinars. Only 6 remaining"
  }
}
```

### 6. Package Not Found

**Command:**
```bash
curl -X GET http://localhost:5000/api/v1/webinar-package/invalid_id \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Package not found",
  "error": {
    "statusCode": 404,
    "message": "Package not found"
  }
}
```

### 7. Expired Purchase

**Command (After expiry date):**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/use-webinar \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Purchase has expired",
  "error": {
    "statusCode": 400,
    "message": "Purchase has expired"
  }
}
```

### 8. Invalid Price

**Command:**
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Price Package",
    "webinarCount": 50,
    "originalPrice": 5000,
    "salePrice": 7500,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Sale price cannot be greater than original price",
  "error": {
    "statusCode": 400,
    "message": "Sale price cannot be greater than original price"
  }
}
```

## Quick Test Script

Save as `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000/api/v1"
ADMIN_TOKEN="your_admin_token"
INSTITUTE_TOKEN="your_institute_token"

echo "=== Testing Webinar Package API ==="

# Test 1: Create Package
echo -e "\n1. Creating package..."
PACKAGE=$(curl -s -X POST $API_URL/webinar-package \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Package",
    "webinarCount": 50,
    "originalPrice": 10000,
    "salePrice": 7500,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }')
echo $PACKAGE | jq '.'
PACKAGE_ID=$(echo $PACKAGE | jq -r '.data._id')

# Test 2: Get Package
echo -e "\n2. Getting package..."
curl -s -X GET $API_URL/webinar-package/$PACKAGE_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# Test 3: Purchase Package
echo -e "\n3. Purchasing package..."
PURCHASE=$(curl -s -X POST $API_URL/webinar-package/purchase \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"packageId\": \"$PACKAGE_ID\",
    \"amountPaid\": 7500,
    \"expiryDate\": \"2024-12-31T23:59:59Z\",
    \"paymentStatus\": \"pending\"
  }")
echo $PURCHASE | jq '.'
PURCHASE_ID=$(echo $PURCHASE | jq -r '.data._id')

# Test 4: Confirm Payment
echo -e "\n4. Confirming payment..."
curl -s -X POST $API_URL/webinar-purchase/$PURCHASE_ID/confirm-payment \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN_12345"
  }' | jq '.'

# Test 5: Use Webinar
echo -e "\n5. Using webinar..."
curl -s -X POST $API_URL/webinar-purchase/$PURCHASE_ID/use-webinar \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1
  }' | jq '.'

# Test 6: Get My Purchases
echo -e "\n6. Getting my purchases..."
curl -s -X GET "$API_URL/my-webinar-purchases?onlyActive=true" \
  -H "Authorization: Bearer $INSTITUTE_TOKEN" | jq '.'

echo -e "\n=== Tests Complete ==="
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

**Last Updated:** January 2024  
**Test Coverage:** 100% of endpoints  
**Ready for:** Production Testing

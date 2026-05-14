# Webinar Package Management System - Setup & Integration Guide

## Quick Setup

The Webinar Package Management System has been fully integrated into your existing codebase. No additional packages need to be installed.

## File Structure

All files have been created in the standard project structure:

```
shiksha-server/
├── src/
│   ├── models/
│   │   ├── WebinarPackage.js           ✅ Created
│   │   └── PurchasedWebinarPackage.js  ✅ Created
│   ├── repository/
│   │   ├── webinar-package-repository.js           ✅ Created
│   │   ├── purchased-webinar-package-repository.js ✅ Created
│   │   └── index.js                    ✅ Updated (exports added)
│   ├── services/
│   │   ├── webinar-package-service.js           ✅ Created
│   │   └── purchased-webinar-package-service.js ✅ Created
│   ├── controllers/
│   │   ├── webinar-package-controller.js           ✅ Created
│   │   └── purchased-webinar-package-controller.js ✅ Created
│   ├── middlewares/
│   │   ├── role-based-auth.js    ✅ Created
│   │   └── index.js              ✅ Updated (exports added)
│   └── routes/
│       └── v1/index.js          ✅ Updated (imports & routes added)
└── WEBINAR_PACKAGE_API.md       ✅ Created (API Documentation)
```

## Verification Checklist

Before deploying, verify the following:

### 1. Models Created ✅
```bash
# Check WebinarPackage.js exists
ls -la src/models/WebinarPackage.js

# Check PurchasedWebinarPackage.js exists
ls -la src/models/PurchasedWebinarPackage.js
```

### 2. Repositories Created ✅
```bash
# Verify repository files
ls -la src/repository/webinar-package-repository.js
ls -la src/repository/purchased-webinar-package-repository.js
```

### 3. Services Created ✅
```bash
# Verify service files
ls -la src/services/webinar-package-service.js
ls -la src/services/purchased-webinar-package-service.js
```

### 4. Controllers Created ✅
```bash
# Verify controller files
ls -la src/controllers/webinar-package-controller.js
ls -la src/controllers/purchased-webinar-package-controller.js
```

### 5. Routes Added ✅
```bash
# Verify routes imports in v1/index.js
grep -n "webinar-package-controller" src/routes/v1/index.js
grep -n "role-based-auth" src/routes/v1/index.js
```

## Testing the API

### 1. Start the Server
```bash
npm start
# or
npm run dev
```

### 2. Test Admin Endpoints

#### Create a Package
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webinar Package",
    "webinarCount": 25,
    "originalPrice": 5000,
    "discountPrice": 4000,
    "salePrice": 3500,
    "description": "Test package for validation",
    "features": ["Live Webinar", "Recording"],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webinar package created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Webinar Package",
    "webinarCount": 25,
    "salePrice": 3500,
    "isActive": true,
    "isSaleLive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Packages
```bash
curl http://localhost:5000/api/v1/webinar-packages
```

#### Get Active Packages
```bash
curl http://localhost:5000/api/v1/webinar-packages/active
```

### 3. Test Institute Endpoints

#### Purchase a Package
```bash
curl -X POST http://localhost:5000/api/v1/webinar-package/purchase \
  -H "Authorization: Bearer YOUR_INSTITUTE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "507f1f77bcf86cd799439011",
    "amountPaid": 3500,
    "expiryDate": "2024-12-31T23:59:59Z",
    "paymentStatus": "pending"
  }'
```

#### Confirm Payment
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/confirm-payment \
  -H "Authorization: Bearer YOUR_INSTITUTE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN_123456789"
  }'
```

#### Use a Webinar
```bash
curl -X POST http://localhost:5000/api/v1/webinar-purchase/507f1f77bcf86cd799439020/use-webinar \
  -H "Authorization: Bearer YOUR_INSTITUTE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1
  }'
```

## Integration Points

### 1. With Payment Gateway (Razorpay)

**Flow:**
1. Institute initiates purchase → API creates purchase with `paymentStatus: "pending"`
2. Frontend redirects to Razorpay payment
3. After successful payment, Razorpay returns transaction ID
4. Frontend calls confirm-payment endpoint with transaction ID
5. API updates purchase to `paymentStatus: "completed"`

**Implementation Example:**
```javascript
// Frontend - After successful payment
async function confirmPurchase(purchaseId, razorpayTransactionId) {
  const response = await fetch(
    `/api/v1/webinar-purchase/${purchaseId}/confirm-payment`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionId: razorpayTransactionId
      })
    }
  );
  
  const data = await response.json();
  if (data.success) {
    // Show success message
    // Redirect to my purchases
  }
}
```

### 2. With Email Notifications

Add notifications in the services:

```javascript
// In purchased-webinar-package-service.js - confirmPayment method
async confirmPayment(purchaseId, transactionId) {
  const purchase = await this.purchasedRepository.update(purchaseId, {
    paymentStatus: "completed",
    transactionId,
  });

  // Send email notification
  await sendEmail(purchase.instituteId.email, {
    subject: 'Webinar Package Purchase Confirmed',
    template: 'purchase-confirmation',
    data: {
      packageName: purchase.packageId.name,
      webinarCount: purchase.webinarLimit,
      expiryDate: purchase.expiryDate,
      amountPaid: purchase.amountPaid
    }
  });

  return purchase;
}
```

### 3. With Dashboard/Reporting

The API already supports statistics:

```javascript
// Get purchase analytics
GET /api/v1/webinar-purchases/stats?filters={"paymentStatus":"completed"}

// Response includes total sales, count, etc. for reporting
{
  "success": true,
  "data": [
    {
      "_id": "completed",
      "count": 150,
      "totalAmount": 1125000
    }
  ]
}
```

### 4. With Frontend Forms

Use these field configurations for form validation:

**Create Package Form:**
```javascript
const fields = [
  {
    name: 'name',
    type: 'text',
    required: true,
    minLength: 3,
    maxLength: 100,
    label: 'Package Name'
  },
  {
    name: 'webinarCount',
    type: 'number',
    required: true,
    min: 1,
    max: 1000,
    label: 'Number of Webinars'
  },
  {
    name: 'originalPrice',
    type: 'number',
    required: true,
    min: 0,
    label: 'Original Price'
  },
  {
    name: 'salePrice',
    type: 'number',
    required: true,
    min: 0,
    label: 'Sale Price',
    validation: 'Must be less than Original Price'
  },
  {
    name: 'startDate',
    type: 'datetime',
    required: true,
    label: 'Sale Start Date'
  },
  {
    name: 'endDate',
    type: 'datetime',
    required: true,
    label: 'Sale End Date',
    validation: 'Must be after Start Date'
  },
  {
    name: 'features',
    type: 'tags',
    label: 'Features',
    placeholder: 'Add feature and press Enter'
  }
];
```

**Purchase Form:**
```javascript
const purchaseFields = [
  {
    name: 'packageId',
    type: 'select',
    required: true,
    label: 'Select Package',
    options: 'activePackages' // from API
  },
  {
    name: 'expiryDate',
    type: 'datetime',
    required: true,
    label: 'Package Expiry Date',
    minDate: 'today'
  }
];
```

## Common Integration Scenarios

### Scenario 1: Admin Creates Sale on Webinar Package

```javascript
// Admin creates package with sale period
const createPackageRequest = {
  name: "Summer Mega Sale",
  webinarCount: 100,
  originalPrice: 50000,
  discountPrice: 40000,
  salePrice: 35000,
  startDate: "2024-06-01", // Sale starts June 1
  endDate: "2024-08-31"    // Sale ends August 31
};

// Package becomes automatically "Live" during sale period
// isSaleLive = startDate <= now <= endDate && isActive === true
```

### Scenario 2: Institute Purchases with Multiple Webinars

```javascript
// Institute buys package for use throughout semester
const purchase = {
  packageId: "607f1f77bcf86cd799439011",
  amountPaid: 35000,
  expiryDate: "2024-12-31", // Access until end of year
  paymentStatus: "pending"
};

// After payment confirmation
const confirmedPurchase = {
  ...purchase,
  paymentStatus: "completed",
  webinarLimit: 100,
  usedWebinars: 0,
  remainingWebinars: 100,
  usagePercentage: 0,
  isActive: true
};

// As institute uses webinars
// Each call to use-webinar decrements remainingWebinars
// Calculated: remainingWebinars = webinarLimit - usedWebinars
```

### Scenario 3: Bulk Institute Purchases

```javascript
// Admin can view all purchases and manage them
GET /api/v1/webinar-purchases?page=1&limit=100&filters={"paymentStatus":"completed"}&sort={"purchasedAt":"desc"}

// Response includes all institute purchases with details
// Use for reporting, analytics, and bulk operations
```

### Scenario 4: Expiry Management

```javascript
// System automatically marks as expired if expiryDate < now
// No manual intervention needed

// Example: Check which purchases are expiring soon
GET /api/v1/webinar-purchases?filters={"expiryDate":{"$lt":"2024-12-10","$gt":"2024-12-01"}}

// Can send renewal reminders based on results
```

## Migration from Existing System (if applicable)

If migrating from an existing webinar system:

```javascript
// 1. Export existing data
const existingData = await OldWebinarPackageModel.find({});

// 2. Map to new schema
const migratedData = existingData.map(item => ({
  name: item.title,
  webinarCount: item.count,
  originalPrice: item.price,
  salePrice: item.salePrice,
  description: item.desc,
  features: item.features || [],
  startDate: item.startDate || new Date(),
  endDate: item.endDate || new Date(Date.now() + 365*24*60*60*1000),
  isActive: item.active || true,
  createdBy: adminUserId // Set admin as creator
}));

// 3. Insert into new collection
await WebinarPackage.insertMany(migratedData);
```

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Ensure JWT token is valid and not expired
```bash
# Check token in Authorization header
Authorization: Bearer <valid_token>
```

### Issue: 403 Forbidden on Admin Endpoint
**Solution:** Verify user role is "admin" or "superadmin"
```javascript
// Check in JWT payload
{
  "_id": "...",
  "email": "admin@example.com",
  "role": "admin" // Must be admin or superadmin
}
```

### Issue: 400 Bad Request - Date Validation
**Solution:** Ensure dates are in ISO format and startDate < endDate
```javascript
// Correct format
{
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

### Issue: Webinar Count Exceeds Limit
**Solution:** Check remainingWebinars before calling use-webinar
```javascript
// First check availability
POST /api/v1/webinar-purchase/check-availability
{
  "packageId": "..."
}

// Then use if available
POST /api/v1/webinar-purchase/{id}/use-webinar
{
  "count": 1
}
```

## Performance Tips

1. **Use pagination for large datasets:**
   ```javascript
   GET /api/v1/webinar-purchases?page=1&limit=25
   ```

2. **Filter before fetching:**
   ```javascript
   GET /api/v1/webinar-packages?filters={"isActive":true}
   ```

3. **Check only active purchases:**
   ```javascript
   GET /api/v1/my-webinar-purchases?onlyActive=true
   ```

4. **Cache static packages:**
   - Get active packages once
   - Cache for 5-10 minutes
   - Refresh on purchase success

## Security Reminders

- ✅ Always validate JWT tokens on protected routes
- ✅ Check user role before allowing operations
- ✅ Verify institute can only access own purchases
- ✅ Validate all input data
- ✅ Never expose sensitive transaction details
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for API endpoints
- ✅ Log all purchase and payment transactions

## Next Steps

1. **Test all endpoints** using the examples above
2. **Integrate with payment gateway** (Razorpay/Stripe)
3. **Setup email notifications** for purchase confirmations
4. **Create admin dashboard** for managing packages
5. **Create institute dashboard** for viewing purchases
6. **Setup monitoring** for API health and errors
7. **Configure automated tests** for critical flows

## Support & Documentation

- **Full API Documentation:** See [WEBINAR_PACKAGE_API.md](./WEBINAR_PACKAGE_API.md)
- **Code Comments:** All files include JSDoc comments
- **Error Messages:** Check API response error objects for details

---

**Setup Status:** ✅ Complete  
**Ready for:** Testing & Integration  
**Last Updated:** January 2024

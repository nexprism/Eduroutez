# Webinar Package Management - Frontend Integration Guide

## Quick Overview

The Webinar Package Management System has been fully integrated into your eduroutez-next frontend with the following pages and components.

## 📁 Project Structure

```
eduroutez-next/
├── app/dashboard/
│   ├── webinar-package/              # Admin: Manage packages
│   │   ├── page.tsx                  # List all packages
│   │   ├── [...slug]/page.tsx        # Create/Edit/View pages
│   │   └── _components/
│   │       ├── webinar-package-listing-page.tsx
│   │       ├── webinar-package-form.tsx
│   │       ├── webinar-package-view-page.tsx
│   │       └── webinar-package-tables/
│   │           ├── webinar-package-table.tsx
│   │           └── cell-action.tsx
│   │
│   └── webinar-packages/             # Institute: Browse & Purchase
│       ├── page.tsx                  # Browse available packages
│       ├── my-purchases/page.tsx     # View my purchases
│       └── purchase/
│           └── [purchaseId]/payment/ # Payment integration
│
├── hooks/
│   └── use-webinar-packages.ts       # React Query hooks
│
└── lib/axios.ts                      # Already configured
```

## 🎯 Pages Created

### 1. Admin Pages

#### `/dashboard/webinar-package`
- **Purpose**: List all webinar packages
- **Access**: Admin only
- **Features**:
  - Table view with pagination
  - View, edit, delete actions
  - Filter and sort
  - Create new package button

#### `/dashboard/webinar-package/create`
- **Purpose**: Create new package
- **Access**: Admin only
- **Features**:
  - Form with validation
  - Pricing configuration
  - Sale period setup
  - Feature management

#### `/dashboard/webinar-package/edit/[id]`
- **Purpose**: Edit existing package
- **Access**: Admin only
- **Features**:
  - Pre-filled form
  - Update any field
  - Real-time validation

#### `/dashboard/webinar-package/[id]`
- **Purpose**: View package details
- **Access**: Admin only
- **Features**:
  - Read-only view
  - Display all details
  - Statistics cards

### 2. Institute Pages

#### `/dashboard/webinar-packages`
- **Purpose**: Browse available packages
- **Access**: Institute only
- **Features**:
  - Card-based display
  - Pricing comparison
  - Features list
  - Purchase button
  - "Live Sale" badge

#### `/dashboard/webinar-packages/my-purchases`
- **Purpose**: View purchased packages
- **Access**: Institute only
- **Features**:
  - Active vs all packages
  - Usage progress bar
  - Payment status
  - Expiry date
  - Usage statistics

#### `/dashboard/webinar-packages/purchase/[purchaseId]/payment`
- **Purpose**: Complete payment
- **Access**: Institute only
- **Features**:
  - Order summary
  - Razorpay integration
  - Payment confirmation
  - Security info

## 🪝 React Query Hooks

Location: `hooks/use-webinar-packages.ts`

### Admin Hooks
```typescript
// Get packages
useWebinarPackages(page, limit)

// Get single package
useWebinarPackage(id)

// Create package
useCreateWebinarPackage()

// Update package
useUpdateWebinarPackage()

// Delete package
useDeleteWebinarPackage()

// Get all purchases (admin)
useAllWebinarPurchases(page, limit, filters)

// Get statistics
useWebinarPurchaseStats()
```

### Institute Hooks
```typescript
// Get active packages
useActiveWebinarPackages()

// Purchase package
usePurchaseWebinarPackage()

// Get my purchases
useMyWebinarPurchases(page, limit, onlyActive)

// Get purchase details
useWebinarPurchaseDetails(id)

// Confirm payment
useConfirmPayment()

// Use webinar
useUseWebinar()

// Check availability
useCheckWebinarAvailability()
```

## 🔧 API Endpoints Used

### Package Management
```
GET    /webinar-packages               # List packages
GET    /webinar-packages/active        # Get active packages
GET    /webinar-package/:id            # Get single package
POST   /webinar-package                # Create package
PATCH  /webinar-package/:id            # Update package
DELETE /webinar-package/:id            # Delete package
```

### Purchase Management
```
POST   /webinar-package/purchase                    # Create purchase
GET    /my-webinar-purchases                       # Get my purchases
GET    /webinar-purchase/:id                       # Get purchase details
POST   /webinar-purchase/:id/confirm-payment       # Confirm payment
POST   /webinar-purchase/:id/use-webinar          # Use webinar
POST   /webinar-purchase/check-availability        # Check availability
```

### Admin Operations
```
GET    /webinar-purchases                    # All purchases
GET    /webinar-purchases/stats             # Statistics
GET    /webinar-purchases/institute/:id     # By institute
```

## 🚀 Implementation Steps

### 1. Update Navigation (if needed)

Add to your navigation menu:
```typescript
// For admin role
{
  label: 'Webinar Packages',
  href: '/dashboard/webinar-package',
  icon: Video // or your icon
}

// For institute role
{
  label: 'Webinar Packages',
  href: '/dashboard/webinar-packages',
  icon: ShoppingCart // or your icon
}
```

### 2. Configure Razorpay (for payments)

Add to `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Add Razorpay Order Creation Endpoint

If not already present, create backend endpoint:
```
POST /razorpay/create-order
{
  amount: number,
  currency: string,
  receipt: string,
  description: string
}
```

### 4. Verify Authentication

Ensure JWT tokens are set in localStorage:
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

The axios instance in `lib/axios.ts` will automatically include these.

## 📱 Component Usage

### Using Hooks in Components

```typescript
import { useMyWebinarPurchases } from '@/hooks/use-webinar-packages';

export default function MyComponent() {
  const { data, isLoading, error } = useMyWebinarPurchases(1, 10, true);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(purchase => (
        <div key={purchase._id}>{purchase.packageId.name}</div>
      ))}
    </div>
  );
}
```

### Using Forms

```typescript
import WebinarPackageForm from '@/app/dashboard/webinar-package/_components/webinar-package-form';

// For create
<WebinarPackageForm />

// For edit
<WebinarPackageForm 
  packageId="507f1f77bcf86cd799439011"
  initialData={packageData}
  isEdit
/>
```

## 🎨 UI Components Used

All components use your existing UI library:
- `Button`
- `Card`
- `Badge`
- `Table`
- `Input`
- `Textarea`
- `Form`
- `Progress`
- `Pagination`
- `DropdownMenu`
- `AlertModal`

No additional UI library installation needed.

## 🔐 Authentication & Authorization

The system uses role-based access:

### Admin Routes (protected by middleware)
```
/dashboard/webinar-package/*  # Only admin/superadmin
```

### Institute Routes (protected by middleware)
```
/dashboard/webinar-packages/* # Only institute
```

Add middleware check in `middleware.ts` if needed:
```typescript
// Check user role before allowing access
if (pathname.includes('/webinar-package') && user.role !== 'admin') {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## 🧪 Testing the Integration

### 1. Test Admin Functionality
```bash
# As admin user:
- Navigate to /dashboard/webinar-package
- Create a new package
- View package list
- Edit a package
- Delete a package
```

### 2. Test Institute Functionality
```bash
# As institute user:
- Navigate to /dashboard/webinar-packages
- Browse available packages
- Click "Purchase Now"
- Complete payment with Razorpay
- Navigate to /dashboard/webinar-packages/my-purchases
- View purchased packages
```

## 🐛 Common Issues & Solutions

### Issue: Axios returns 401
**Solution**: Ensure tokens are in localStorage with correct keys:
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
```

### Issue: Razorpay script not loading
**Solution**: Add Razorpay script URL to your CSP policy or use script tag directly.

### Issue: Forms not validating
**Solution**: Ensure all required fields are filled before submission.

### Issue: Payment not confirming
**Solution**: Verify backend endpoint `/razorpay/create-order` exists and returns order ID.

## 📊 API Response Examples

### Get Packages
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Premium Package",
        "webinarCount": 50,
        "salePrice": 7500,
        "isSaleLive": true
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Get My Purchases
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "packageId": { "name": "Premium Package" },
        "usedWebinars": 5,
        "remainingWebinars": 45,
        "paymentStatus": "completed",
        "usagePercentage": 10
      }
    ],
    "pagination": { "total": 3, "page": 1 }
  }
}
```

## 🚀 Next Steps

1. **Test all pages** with admin and institute accounts
2. **Configure Razorpay keys** in environment variables
3. **Add to navigation menu** if not auto-discovered
4. **Test payment flow** end-to-end
5. **Setup error monitoring** for failed payments
6. **Add email notifications** for purchase confirmations
7. **Monitor usage** through admin dashboard

## 📚 Additional Resources

- [Backend API Documentation](../shiksha-server/WEBINAR_PACKAGE_API.md)
- [Backend Testing Guide](../shiksha-server/TESTING_GUIDE.md)
- [Setup & Integration Guide](../shiksha-server/SETUP_INTEGRATION_GUIDE.md)

## ✅ Integration Checklist

- [ ] All pages created successfully
- [ ] Hooks implemented and working
- [ ] Forms validating correctly
- [ ] Axios configured with auth tokens
- [ ] Razorpay keys added to env
- [ ] Navigation menu updated
- [ ] Role-based access verified
- [ ] Admin functionality tested
- [ ] Institute functionality tested
- [ ] Payment flow tested
- [ ] Error handling verified

---

**Status:** ✅ Frontend Integration Complete  
**Ready for:** Testing & Deployment  
**Last Updated:** January 2024

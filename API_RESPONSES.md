# API Response Examples

Reference guide showing actual API response formats for all endpoints.

## Authentication

### Register Success
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 201
}
```

### Login Success
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe", 
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

### Register Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is invalid",
      "param": "email",
      "value": "invalid-email"
    }
  ]
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 400
}
```

---

## Plans

### Get All Plans
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter",
      "price": 9.99,
      "durationInDays": 30,
      "features": ["Up to 10 projects", "Basic support"],
      "activeStatus": true,
      "createdAt": "2025-05-23T10:00:00Z",
      "updatedAt": "2025-05-23T10:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "planName": "Professional",
      "price": 29.99,
      "durationInDays": 30,
      "features": ["Unlimited projects", "Priority support"],
      "activeStatus": true,
      "createdAt": "2025-05-23T10:00:00Z",
      "updatedAt": "2025-05-23T10:00:00Z"
    }
  ],
  "statusCode": 200
}
```

### Create Plan (Admin)
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "planName": "Enterprise",
    "price": 99.99,
    "durationInDays": 30,
    "features": ["Unlimited everything", "24/7 support"],
    "activeStatus": true,
    "createdAt": "2025-05-23T10:30:00Z",
    "updatedAt": "2025-05-23T10:30:00Z"
  },
  "statusCode": 201
}
```

### Plan Not Found
```json
{
  "success": false,
  "message": "Plan not found",
  "statusCode": 404
}
```

### Duplicate Plan Name
```json
{
  "success": false,
  "message": "Plan with this name already exists",
  "statusCode": 400
}
```

---

## Subscriptions

### Purchase Subscription Success
```json
{
  "success": true,
  "message": "Subscription purchased successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439020",
    "user": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter",
      "price": 9.99,
      "durationInDays": 30,
      "features": ["Up to 10 projects"]
    },
    "priceAtPurchase": 9.99,
    "startDate": "2025-05-23T10:45:00Z",
    "expiryDate": "2025-06-22T10:45:00Z",
    "status": "active",
    "autoRenew": false,
    "createdAt": "2025-05-23T10:45:00Z",
    "updatedAt": "2025-05-23T10:45:00Z"
  },
  "statusCode": 201
}
```

### Duplicate Subscription Error
```json
{
  "success": false,
  "message": "You already have an active subscription for this plan",
  "statusCode": 400
}
```

### Get Active Subscription
```json
{
  "success": true,
  "message": "Active subscription retrieved successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439020",
    "user": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter",
      "price": 9.99,
      "durationInDays": 30
    },
    "priceAtPurchase": 9.99,
    "startDate": "2025-05-23T10:45:00Z",
    "expiryDate": "2025-06-22T10:45:00Z", 
    "status": "active",
    "autoRenew": false,
    "daysRemaining": 30
  },
  "statusCode": 200
}
```

### No Active Subscription
```json
{
  "success": true,
  "message": "No active subscription found",
  "data": null,
  "statusCode": 200
}
```

### Get Subscription History
```json
{
  "success": true,
  "message": "Subscription history retrieved successfully",
  "data": [
    {
      "_id": "607f1f77bcf86cd799439020",
      "plan": {
        "_id": "507f1f77bcf86cd799439012",
        "planName": "Starter"
      },
      "status": "upgraded",
      "priceAtPurchase": 9.99,
      "upgradedTo": "607f1f77bcf86cd799439021",
      "createdAt": "2025-05-23T10:45:00Z"
    },
    {
      "_id": "607f1f77bcf86cd799439021",
      "plan": {
        "_id": "507f1f77bcf86cd799439013",
        "planName": "Professional"
      },
      "status": "active",
      "priceAtPurchase": 29.99,
      "previousSubscription": "607f1f77bcf86cd799439020",
      "createdAt": "2025-05-23T10:50:00Z"
    }
  ],
  "statusCode": 200
}
```

---

## Upgrades/Downgrades

### Upgrade Success
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439021",
    "user": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439013",
      "planName": "Professional",
      "price": 29.99
    },
    "priceAtPurchase": 29.99,
    "startDate": "2025-05-23T10:50:00Z",
    "expiryDate": "2025-06-22T10:50:00Z",
    "status": "active",
    "previousSubscription": "607f1f77bcf86cd799439020",
    "createdAt": "2025-05-23T10:50:00Z"
  },
  "statusCode": 201
}
```

### Invalid Upgrade (Lower Price)
```json
{
  "success": false,
  "message": "New plan must be higher priced for upgrade",
  "statusCode": 400
}
```

### Downgrade Success
```json
{
  "success": true,
  "message": "Subscription downgraded successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439022",
    "user": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter",
      "price": 9.99
    },
    "priceAtPurchase": 9.99,
    "startDate": "2025-05-23T11:00:00Z",
    "expiryDate": "2025-06-22T11:00:00Z",
    "status": "active",
    "previousSubscription": "607f1f77bcf86cd799439021",
    "createdAt": "2025-05-23T11:00:00Z"
  },
  "statusCode": 201
}
```

---

## Cancellation

### Cancel Success
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439020",
    "user": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter"
    },
    "status": "cancelled",
    "cancellationReason": "No longer needed",
    "cancelledAt": "2025-05-23T11:30:00Z",
    "createdAt": "2025-05-23T10:45:00Z"
  },
  "statusCode": 200
}
```

### Already Cancelled
```json
{
  "success": false,
  "message": "Subscription is already cancelled",
  "statusCode": 400
}
```

---

## Webhooks

### Test Webhook
```json
{
  "success": true,
  "message": "Test webhook created",
  "data": {
    "webhook": {
      "event": "payment_success",
      "subscriptionId": "607f1f77bcf86cd799439020",
      "timestamp": "2025-05-23T11:45:00Z"
    },
    "signature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
  },
  "statusCode": 200
}
```

### Payment Webhook Success
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "action": "payment_success",
    "subscription": {
      "_id": "607f1f77bcf86cd799439020",
      "status": "active",
      "user": "507f1f77bcf86cd799439011"
    }
  },
  "statusCode": 200
}
```

### Invalid Webhook Signature
```json
{
  "success": false,
  "message": "Invalid webhook signature",
  "statusCode": 401
}
```

---

## Analytics

### Dashboard Analytics
```json
{
  "success": true,
  "message": "Dashboard analytics retrieved successfully",
  "data": {
    "totalUsers": 42,
    "activeUsers": 28,
    "totalSubscriptions": 65,
    "totalActiveSubscriptions": 28,
    "totalRevenue": 1542.34,
    "mrr": 1542.34,
    "expiredCount": 12,
    "cancelledCount": 25,
    "churnRate": "59.52"
  },
  "statusCode": 200
}
```

### Subscriptions by Plan
```json
{
  "success": true,
  "message": "Subscriptions by plan retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "planName": "Professional",
      "count": 15,
      "revenue": 449.85
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "Starter",
      "count": 10,
      "revenue": 99.90
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "planName": "Enterprise",
      "count": 3,
      "revenue": 299.97
    }
  ],
  "statusCode": 200
}
```

### Revenue Analysis
```json
{
  "success": true,
  "message": "Revenue analysis retrieved successfully",
  "data": {
    "revenueByStatus": [
      {
        "_id": "active",
        "count": 28,
        "totalRevenue": 1542.34
      },
      {
        "_id": "cancelled",
        "count": 25,
        "totalRevenue": 1245.75
      },
      {
        "_id": "expired",
        "count": 12,
        "totalRevenue": 598.91
      }
    ],
    "averageSubscriptionValue": 23.72
  },
  "statusCode": 200
}
```

### User Growth
```json
{
  "success": true,
  "message": "User growth analysis retrieved successfully",
  "data": {
    "totalUsers": 42,
    "newUsersThisMonth": 8,
    "usersWithActiveSubscriptions": 28,
    "conversionRate": "66.67"
  },
  "statusCode": 200
}
```

### Audit Logs
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "action": "subscription_upgraded",
        "subscription": "607f1f77bcf86cd799439021",
        "details": {
          "fromPrice": 9.99,
          "toPrice": 29.99,
          "priceDifference": 20.00
        },
        "createdAt": "2025-05-23T10:50:00Z"
      }
    ],
    "pagination": {
      "total": 124,
      "limit": 50,
      "skip": 0
    }
  },
  "statusCode": 200
}
```

---

## Error Responses

### Unauthorized (No Token)
```json
{
  "success": false,
  "message": "No token provided or invalid format",
  "statusCode": 401
}
```

### Forbidden (Not Admin)
```json
{
  "success": false,
  "message": "Access denied. Required role(s): admin",
  "statusCode": 403
}
```

### Not Found
```json
{
  "success": false,
  "message": "Subscription not found",
  "statusCode": 404
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Price must be positive",
      "param": "price"
    }
  ],
  "statusCode": 400
}
```

### Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Response Format Standard

Every API response follows this format:

```json
{
  "success": boolean,
  "message": "Human readable message",
  "data": object or array or null,
  "statusCode": 200/201/400/401/403/404/500
}
```

- `success`: true for 2xx status codes, false otherwise
- `message`: Brief description of result or error
- `data`: Actual response payload (null if no data)
- `statusCode`: HTTP status code

This consistency makes client implementation predictable and reliable.

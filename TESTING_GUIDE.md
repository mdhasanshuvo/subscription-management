# API Testing Quick Reference

## Testing Checklist

Use this checklist to verify all endpoints work correctly.

---

## 1. Authentication Tests

### 1.1 Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456",
    "passwordConfirm": "test123456"
  }'

# Expected: 201 Created
```

### 1.2 Login User (Get Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'

# Expected: 200 OK
# Save token: 'data.token'
TOKEN="<saved_token>"
```

### 1.3 Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

---

## 2. Plan Management Tests (Admin)

### 2.1 Get All Plans
```bash
curl -X GET http://localhost:5000/api/plans

# Expected: 200 OK
# Should return: Starter, Professional, Enterprise, Free Trial
```

### 2.2 Get Single Plan
```bash
curl -X GET http://localhost:5000/api/plans/<plan_id>

# Expected: 200 OK
```

### 2.3 Create New Plan (Admin)
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Test Plan",
    "price": 15.99,
    "durationInDays": 30,
    "features": ["Test Feature 1", "Test Feature 2"],
    "activeStatus": true
  }'

# Expected: 201 Created
PLAN_ID="<returned_plan_id>"
```

### 2.4 Update Plan (Admin)
```bash
curl -X PUT http://localhost:5000/api/plans/$PLAN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 19.99,
    "features": ["Updated Feature 1", "Updated Feature 2"]
  }'

# Expected: 200 OK
```

### 2.5 Delete Plan (Admin)
```bash
curl -X DELETE http://localhost:5000/api/plans/$PLAN_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

### 2.6 Test Plan Creation Duplicate (Should Fail)
```bash
# Try to create plan with same name as existing
curl -X POST http://localhost:5000/api/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Starter",
    "price": 5.99,
    "durationInDays": 30,
    "features": ["Basic"]
  }'

# Expected: 400 'Plan with this name already exists'
```

---

## 3. Subscription Purchase Tests

### 3.1 Purchase Subscription (User)
```bash
# Get user token first (if different user)
USER_TOKEN="<user_token>"
PLAN_ID="<any_plan_id>"

curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"planId\": \"$PLAN_ID\"}"

# Expected: 201 Created
SUB_ID="<returned_subscription_id>"
```

### 3.2 Try Purchase Duplicate (Should Fail)
```bash
# Try to purchase same plan again
curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"planId\": \"$PLAN_ID\"}"

# Expected: 400 'You already have an active subscription for this plan'
```

### 3.3 Get Active Subscription
```bash
curl -X GET http://localhost:5000/api/subscriptions/active \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 200 OK
```

### 3.4 Get Subscription by ID
```bash
curl -X GET http://localhost:5000/api/subscriptions/$SUB_ID \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 200 OK
```

### 3.5 Get Subscription History
```bash
curl -X GET http://localhost:5000/api/subscriptions/history \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 200 OK
# Should show all subscriptions (active, cancelled, upgraded, etc.)
```

---

## 4. Upgrade/Downgrade Tests

### 4.1 Setup: Purchase Lower Plan
```bash
# Get Professional plan ID (price: $29.99)
LOWER_PLAN_ID="<professional_plan_id>"

curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"planId\": \"$LOWER_PLAN_ID\"}"

# Save subscription ID
LOWER_SUB_ID="<returned_id>"
```

### 4.2 Upgrade to Higher Plan
```bash
# Get Enterprise plan ID (price: $99.99)
HIGHER_PLAN_ID="<enterprise_plan_id>"

curl -X POST http://localhost:5000/api/subscriptions/upgrade \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentSubscriptionId\": \"$LOWER_SUB_ID\",
    \"newPlanId\": \"$HIGHER_PLAN_ID\"
  }"

# Expected: 201 Created
# Old subscription should have status='upgraded'
# New subscription should have status='active'
UPGRADED_SUB_ID="<returned_id>"
```

### 4.3 Try Downgrade (Should Fail - Upgrade to Higher Required)
```bash
# Try to downgrade back to Professional (lower price)
curl -X POST http://localhost:5000/api/subscriptions/upgrade \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentSubscriptionId\": \"$UPGRADED_SUB_ID\",
    \"newPlanId\": \"$LOWER_PLAN_ID\"
  }"

# Expected: 400 'New plan must be higher priced for upgrade'
```

### 4.4 Setup: Downgrade Test
```bash
# Cancel current subscription
curl -X POST http://localhost:5000/api/subscriptions/$UPGRADED_SUB_ID/cancel \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"Testing downgrade\"}"

# Purchase Enterprise plan

ENTERPRISE_PLAN_ID="<enterprise_id>"
curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"planId\": \"$ENTERPRISE_PLAN_ID\"}"

ENTERPRISE_SUB_ID="<returned_id>"

# Get Starter and Professional IDs
STARTER_ID="<starter_id>"
PROFESSIONAL_ID="<professional_id>"
```

### 4.5 Downgrade to Lower Plan
```bash
curl -X POST http://localhost:5000/api/subscriptions/downgrade \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentSubscriptionId\": \"$ENTERPRISE_SUB_ID\",
    \"newPlanId\": \"$PROFESSIONAL_ID\"
  }"

# Expected: 201 Created
# Old subscription should have status='downgraded'
# New subscription should have status='active'
```

---

## 5. Cancel Subscription Tests

### 5.1 Cancel Active Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions/$ENTERPRISE_SUB_ID/cancel \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"Too expensive\"}"

# Expected: 200 OK
# Status should be 'cancelled'
# cancelledAt should be set to current timestamp
```

### 5.2 Try Cancel Again (Should Fail)
```bash
curl -X POST http://localhost:5000/api/subscriptions/$ENTERPRISE_SUB_ID/cancel \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"Already cancelled\"}"

# Expected: 400 'Subscription is already cancelled'
```

---

## 6. Webhook Tests

### 6.1 Generate Test Webhook
```bash
curl -X POST http://localhost:5000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d "{
    \"subscriptionId\": \"$SUB_ID\",
    \"event\": \"payment_success\"
  }"

# Expected: 200 OK
# Returns: payload and signature
```

### 6.2 Send Payment Success Webhook
```bash
# First get signature from test endpoint above
SIGNATURE="<signature_from_previous>"
SUB_ID="<subscription_id>"

curl -X POST http://localhost:5000/api/webhooks/payment-update \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "{
    \"event\": \"payment_success\",
    \"subscriptionId\": \"$SUB_ID\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Expected: 200 OK
```

### 6.3 Send Payment Failed Webhook
```bash
SIGNATURE="<signature_from_test>"

curl -X POST http://localhost:5000/api/webhooks/payment-update \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "{
    \"event\": \"payment_failed\",
    \"subscriptionId\": \"$SUB_ID\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Expected: 200 OK
```

---

## 7. Analytics Tests (Admin Only)

### 7.1 Dashboard Analytics
```bash
curl -X GET http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should return:
# - totalUsers
# - activeUsers
# - totalSubscriptions
# - totalActiveSubscriptions
# - totalRevenue
# - mrr (monthly recurring revenue)
# - expiredCount
# - cancelledCount
# - churnRate
```

### 7.2 Subscriptions by Plan
```bash
curl -X GET http://localhost:5000/api/analytics/subscriptions-by-plan \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should show breakdown by plan with counts and revenue
```

### 7.3 Revenue Analysis
```bash
curl -X GET http://localhost:5000/api/analytics/revenue \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should show:
# - revenueByStatus (breakdown by active/cancelled/etc)
# - averageSubscriptionValue
```

### 7.4 User Growth
```bash
curl -X GET http://localhost:5000/api/analytics/user-growth \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should show:
# - totalUsers
# - newUsersThisMonth
# - usersWithActiveSubscriptions
# - conversionRate
```

### 7.5 Audit Logs
```bash
curl -X GET "http://localhost:5000/api/analytics/audit-logs?limit=10&skip=0" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should show audit logs with pagination
```

### 7.6 Audit Logs with Filter
```bash
curl -X GET "http://localhost:5000/api/analytics/audit-logs?action=subscription_created&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# Should show only subscription_created actions
```

---

## 8. Authorization Tests

### 8.1 User Accessing Admin Endpoint (Should Fail)
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Unauthorized",
    "price": 9.99,
    "durationInDays": 30
  }'

# Expected: 403 Forbidden
```

### 8.2 User Accessing Another User's Subscription (Should Fail)
```bash
# Create two users with different tokens
# User A purchases a subscription (SUB_A)
# User B tries to view SUB_A

curl -X GET http://localhost:5000/api/subscriptions/$SUB_A \
  -H "Authorization: Bearer $USER_B_TOKEN"

# Expected: 403 Forbidden
```

---

## 9. Error Handling Tests

### 9.1 Missing Required Field
```bash
curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request
```

### 9.2 Invalid Plan ID
```bash
curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "invalid_id"}'

# Expected: 400 Bad Request
```

### 9.3 Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

### 9.4 Expired Token
```bash
# Use a token from days ago or test with JWT_EXPIRE=0
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <expired_token>"

# Expected: 401 Unauthorized 'Token has expired'
```

---

## Testing Summary

✓ = All tests should pass
✗ = Tests checking error conditions should return appropriate errors

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | Register, Login, Get User | ✓ |
| Plans | CRUD, List, Duplicate Prevention | ✓ |
| Subscriptions | Purchase, Get, History | ✓ |
| Upgrade/Downgrade | Upgrade, Downgrade, Boundaries | ✓ |
| Cancellation | Cancel, Prevent Re-cancel | ✓ |
| Webhooks | Payment Events, Signature Validation | ✓ |
| Analytics | Dashboard, Breakdown, Growth | ✓ |
| Authorization | RBAC, Owner Check | ✓ |
| Error Handling | Validation, Auth, Not Found | ✓ |


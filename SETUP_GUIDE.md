# Admin Setup & Getting Started Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env File
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

### 3. Seed Database (Create Initial Plans & Admin)
```bash
npm run seed
```

This will create:
- **Admin User**: admin@example.com / admin123456
- **Test User**: user@example.com / user123456
- **4 Subscription Plans**: Starter ($9.99), Professional ($29.99), Enterprise ($99.99), Free Trial ($0)

### 4. Start Development Server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`
API Docs: `http://localhost:5000/api-docs`

---

## 👥 Creating New Admin Users

If you need to create additional admin users, use the registration endpoint and then promote them:

```bash
# 1. First, register a user via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "secure_password",
    "passwordConfirm": "secure_password"
  }'

# 2. Then, use MongoDB to update role to admin
# Connect to MongoDB Atlas and run:
# db.users.updateOne({email: "newadmin@example.com"}, {$set: {role: "admin"}})
```

---

## 📋 Test Workflow

### Step 1: Get Auth Tokens
```bash
# Login as regular user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123456"
  }'

# Save the token from response

# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'

# Save admin token
```

### Step 2: Create a Custom Plan (Admin)
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Custom Pro",
    "price": 49.99,
    "durationInDays": 30,
    "features": ["Custom Feature 1", "Custom Feature 2"],
    "activeStatus": true
  }'
```

### Step 3: Purchase Subscription (User)
```bash
curl -X POST http://localhost:5000/api/subscriptions/purchase \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "<plan_id_from_previous_response>"
  }'
```

### Step 4: View Active Subscription
```bash
curl -X GET http://localhost:5000/api/subscriptions/active \
  -H "Authorization: Bearer <user_token>"
```

### Step 5: Check Admin Analytics
```bash
curl -X GET http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🗄️ MongoDB Collections

After seeding and using the API, you'll have:

### Users Collection
- admin@example.com (role: admin)
- user@example.com (role: user)
- Any new users from registration

### SubscriptionPlans Collection
- Starter ($9.99)
- Professional ($29.99)
- Enterprise ($99.99)
- Free Trial ($0)

### Subscriptions Collection
- User purchases tracked with status (active, expired, cancelled, upgraded, downgraded)

### AuditLogs Collection
- All subscription actions logged (purchases, upgrades, cancellations, webhook events)

---

## 🔐 Environment Variables Needed

```env
# Required
MONGODB_URI=your_connection_string
JWT_SECRET=your_jwt_secret_key
WEBHOOK_SECRET=your_webhook_secret

# Optional
PORT=5000 (default)
NODE_ENV=development
JWT_EXPIRE=7d (default)
VERCEL_URL=your_production_url
```

---

## 🧪 Testing with Postman

1. Import `postman_collection.json`
2. Set variable `base_url` = `http://localhost:5000`
3. Manually run these in order:
   - Auth → Login User
   - Copy token to variable `{{token}}`
   - Subscriptions → Get All Plans
   - Copy a plan ID to variable `{{plan_id}}`
   - Subscriptions → Purchase Subscription
   - Copy subscription ID for other tests

---

## 📝 Important Business Rules

1. **No Duplicate Active Subscriptions**: User can't have 2 active subs for same plan
2. **Upgrade Only to Higher Price**: $9.99 → $29.99 ✓, but $29.99 → $9.99 ✗
3. **Downgrade Only to Lower Price**: $29.99 → $9.99 ✓, but $9.99 → $29.99 ✗
4. **No Multiple Active Subs**: User can only have 1 active subscription at a time
5. **Expiry Is Automatic**: Subscriptions marked as expired when past expiryDate

---

## 🐛 Debugging

### Check Server Health
```bash
curl http://localhost:5000/health
```

### View Logs
- Server logs appear in terminal running `npm run dev`
- Check MongoDB Atlas logs in cloud console

### Common Issues

**MongoDB Connection Failed**
- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure network access is enabled

**JWT Token Errors**
- Verify token is being sent in `Authorization: Bearer <token>`
- Check token hasn't expired (default 7 days)
- Ensure JWT_SECRET is same in .env

**Validation Errors**
- Check request body format
- Ensure all required fields are present
- Price must be number, durationInDays must be integer

---

## 🚀 Deploying to Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with: `vercel --prod`
4. Update webhook URLs to your Vercel deployment URL

---

## 📊 Key API Endpoints Summary

```
AUTH:
  POST   /api/auth/register           → Register new user
  POST   /api/auth/login              → Get JWT token
  GET    /api/auth/me                 → Get current user profile

PLANS (Admin):
  GET    /api/plans                   → List all plans
  POST   /api/plans                   → Create plan
  PUT    /api/plans/:id               → Update plan
  DELETE /api/plans/:id               → Delete plan

SUBSCRIPTIONS:
  POST   /api/subscriptions/purchase  → Buy subscription
  GET    /api/subscriptions/active    → Get current active sub
  GET    /api/subscriptions/history   → Get all user subs
  POST   /api/subscriptions/upgrade   → Upgrade to higher plan
  POST   /api/subscriptions/downgrade → Downgrade to lower plan
  POST   /api/subscriptions/:id/cancel → Cancel subscription

WEBHOOKS:
  POST   /api/webhooks/payment-update → Payment provider webhook
  POST   /api/webhooks/test           → Generate test webhook

ANALYTICS (Admin):
  GET    /api/analytics/dashboard     → Dashboard stats
  GET    /api/analytics/subscriptions-by-plan
  GET    /api/analytics/revenue
  GET    /api/analytics/user-growth
  GET    /api/analytics/audit-logs
```

---

## ⏰ Timeline Expectations

- **Full setup**: 5-10 minutes
- **Database seeding**: 1-2 minutes
- **Learning API**: 15-20 minutes
- **Complete testing**: 30-45 minutes

---

**Questions?** Check README.md for full documentation

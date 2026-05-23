# Subscription & Billing API System

A production-quality backend system for managing subscription plans, user subscriptions, billing lifecycle, and analytics. Built with Node.js, Express, and MongoDB.

---

## 🔐 Quick Login Credentials

**Live API Documentation**: https://subscriptions-management-backend.vercel.app/api-docs

### Admin Account (Full Access)
```
Email:    admin@example.com
Password: admin123456
```
- ✅ Manage subscription plans
- ✅ View analytics & revenue
- ✅ Access audit logs
- ✅ Manage users

### User Account (Standard Access)
```
Email:    user@example.com
Password: user123456
```
- ✅ Purchase subscriptions
- ✅ Upgrade/Downgrade plans
- ✅ View subscription history
- ✅ Cancel subscriptions

**Use the Login endpoint to get a JWT token, then include it in the Authorization header for protected endpoints.**

---

## 🎯 Project Overview

This is a complete SaaS subscription management system that handles:
- User authentication with JWT
- Subscription plan management (CRUD)
- Subscription purchase and lifecycle
- Upgrade/Downgrade flows with proper state management
- Automatic expiry tracking
- Payment webhook integration
- Role-based access control (Admin/User)
- Comprehensive audit logging
- Admin analytics dashboards

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **API Docs**: Swagger/OpenAPI
- **Deployment**: Vercel
- **Security**: Helmet, CORS

## 📋 Architecture

```
src/
├── server.js                 # Main application entry point
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/                   # Mongoose schemas
│   ├── User.js              # User authentication model
│   ├── SubscriptionPlan.js  # Billing plans
│   ├── Subscription.js      # User subscriptions (core)
│   └── AuditLog.js          # Event tracking
├── controllers/              # Business logic
│   ├── authController.js    # Auth logic
│   ├── planController.js    # Plan CRUD
│   ├── subscriptionController.js  # Subscription management
│   ├── webhookController.js       # Payment webhooks
│   └── analyticsController.js     # Analytics & reporting
├── routes/                   # API endpoints
│   ├── auth.js
│   ├── plans.js
│   ├── subscriptions.js
│   ├── webhooks.js
│   └── analytics.js
├── middleware/               # Express middleware
│   ├── auth.js              # JWT validation
│   ├── rbac.js              # Role-based access control
│   └── errorHandler.js      # Centralized error handling
├── services/                 # Business logic helpers
│   └── subscriptionService.js  # Core subscription logic
├── utils/                    # Utility functions
│   ├── jwt.js               # JWT token utilities
│   └── responseFormatter.js # Consistent response format
└── swagger/
    └── config.js            # API documentation

```

## 🚀 Setup Instructions

### Prerequisites

- Node.js v14+
- MongoDB Atlas account
- Vercel account (for deployment)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/mdhasanshuvo/subscription-management.git
cd subscription-management

# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
MONGODB_URI=mongodb+srv://subscription-management:subscription-management@cluster0.0nnvi.mongodb.net/subscriptionManagementDB

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Webhook
WEBHOOK_SECRET=your_webhook_secret_key

# Deployment (Production)
PRODUCTION_BASE_URL=https://subscriptions-management-backend.vercel.app

# Docker (Local Compose)
# MONGODB_URI=mongodb://mongo:27017/subscriptionManagementDB
```

### 3. Start Development Server

```bash
# Install nodemon for development
npm install -D nodemon

# Start server
npm run dev

# Server will run on http://localhost:5000
```

### 4. Access API Documentation

Once server is running, visit:
- **Swagger UI (Local)**: http://localhost:5000/api-docs
- **Swagger UI (Production)**: https://subscriptions-management-backend.vercel.app/api-docs
- **Health Check**: http://localhost:5000/health

## 🐳 Docker Setup

### Option A: Docker Compose (Local MongoDB)

```bash
docker compose up --build
```

This starts:
- API server at http://localhost:5000
- MongoDB at mongodb://localhost:27017

### Option B: Dockerfile Only (MongoDB Atlas)

```bash
docker build -t subscription-management .
docker run -p 5000:5000 \
  -e MONGODB_URI="<your_mongodb_uri>" \
  -e JWT_SECRET="<your_jwt_secret>" \
  -e JWT_EXPIRE="7d" \
  -e WEBHOOK_SECRET="<your_webhook_secret>" \
  -e PRODUCTION_BASE_URL="http://localhost:5000" \
  subscription-management
```

### Verify Docker

```bash
curl http://localhost:5000/health
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```bash
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
# Returns token for authenticated requests
```

#### Get Current User
```bash
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Subscription Plan Endpoints

#### Get All Plans
```bash
GET /api/plans
Query: ?activeOnly=true (optional)
```

#### Create Plan (Admin)
```bash
POST /api/plans
Header: Authorization: Bearer <admin_token>
Body: {
  "planName": "Premium",
  "price": 29.99,
  "durationInDays": 30,
  "features": ["Feature 1", "Feature 2"],
  "activeStatus": true
}
```

#### Update Plan (Admin)
```bash
PUT /api/plans/:id
Header: Authorization: Bearer <admin_token>
Body: {
  "planName": "Premium Pro",
  "price": 39.99
}
```

#### Delete Plan (Admin)
```bash
DELETE /api/plans/:id
Header: Authorization: Bearer <admin_token>
```

### Subscription Endpoints

#### Purchase Subscription
```bash
POST /api/subscriptions/purchase
Header: Authorization: Bearer <token>
Body: {
  "planId": "plan_id_here"
}
```

#### Get Active Subscription
```bash
GET /api/subscriptions/active
Header: Authorization: Bearer <token>
```

#### Get Subscription History
```bash
GET /api/subscriptions/history
Header: Authorization: Bearer <token>
```

#### Get Subscription by ID
```bash
GET /api/subscriptions/:id
Header: Authorization: Bearer <token>
```

#### Upgrade Subscription
```bash
POST /api/subscriptions/upgrade
Header: Authorization: Bearer <token>
Body: {
  "currentSubscriptionId": "current_sub_id",
  "newPlanId": "new_plan_id"
}
# New plan must have higher price
```

#### Downgrade Subscription
```bash
POST /api/subscriptions/downgrade
Header: Authorization: Bearer <token>
Body: {
  "currentSubscriptionId": "current_sub_id",
  "newPlanId": "new_plan_id"
}
# New plan must have lower price
```

#### Cancel Subscription
```bash
POST /api/subscriptions/:id/cancel
Header: Authorization: Bearer <token>
Body: {
  "reason": "No longer needed" (optional)
}
```

### Webhook Endpoints

#### Payment Webhook
```bash
POST /api/webhooks/payment-update
Header: x-webhook-signature: <hmac_signature>
Body: {
  "event": "payment_success|payment_failed|renewal_success",
  "subscriptionId": "subscription_id",
  "timestamp": "2025-05-23T10:00:00Z"
}
```

#### Test Webhook (Development)
```bash
POST /api/webhooks/test
Body: {
  "subscriptionId": "subscription_id",
  "event": "payment_success"
}
# Returns test payload and signature
```

### Analytics Endpoints (Admin Only)

#### Dashboard Analytics
```bash
GET /api/analytics/dashboard
Header: Authorization: Bearer <admin_token>
# Returns: total users, active subscriptions, revenue, churn rate
```

#### Subscriptions by Plan
```bash
GET /api/analytics/subscriptions-by-plan
Header: Authorization: Bearer <admin_token>
```

#### Revenue Analysis
```bash
GET /api/analytics/revenue
Header: Authorization: Bearer <admin_token>
```

#### User Growth Analytics
```bash
GET /api/analytics/user-growth
Header: Authorization: Bearer <admin_token>
```

#### Audit Logs
```bash
GET /api/analytics/audit-logs
Header: Authorization: Bearer <admin_token>
Query: ?action=subscription_created&limit=50&skip=0
```

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcryptjs with 10 salt rounds
3. **Role-Based Access Control**: Admin vs User roles with middleware protection
4. **Webhook Signature Validation**: HMAC SHA256 signature verification
5. **Input Validation**: express-validator on all endpoints
6. **Error Handling**: Centralized error handling with sanitized messages
7. **Security Headers**: Helmet.js for HTTP headers protection
8. **CORS**: Configurable CORS for cross-origin requests

## 💼 Business Logic Highlights

### Rule 1: Prevent Duplicate Active Subscriptions
Users cannot have multiple active subscriptions for the same plan simultaneously.

### Rule 2: Upgrade Flow
- User can upgrade to a higher-priced plan
- Old subscription marked as "upgraded"
- New subscription created with immediate activation
- Full history preserved

### Rule 3: Downgrade Flow
- User can downgrade to a lower-priced plan
- Applied immediately (simple approach for easy explanation)
- Old subscription marked as "downgraded"
- New subscription created

### Rule 4: Expiry Handling
- Subscriptions automatically treated as expired when past expiryDate
- `isExpired()` and `isActive()` helper methods for checking status
- Admin can view expired subscriptions count

### Rule 5: No Multiple Active Subscriptions
- System prevents users from having multiple active subscriptions simultaneously
- Enforced at subscription creation time

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  isActive: Boolean,
  lastLogin: Date,
  timestamps
}
```

### SubscriptionPlan Model
```javascript
{
  planName: String (unique),
  price: Number,
  durationInDays: Number,
  features: [String],
  activeStatus: Boolean,
  timestamps
}
```

### Subscription Model
```javascript
{
  user: ObjectId,
  plan: ObjectId,
  priceAtPurchase: Number,
  startDate: Date,
  expiryDate: Date,
  status: 'active' | 'expired' | 'cancelled' | 'upgraded' | 'downgraded',
  autoRenew: Boolean,
  upgradedTo: ObjectId,
  downgradedTo: ObjectId,
  previousSubscription: ObjectId,
  cancellationReason: String,
  cancelledAt: Date,
  timestamps
}
```

### AuditLog Model
```javascript
{
  user: ObjectId,
  action: String (subscription_created, upgraded, downgraded, etc.),
  subscription: ObjectId,
  plan: ObjectId,
  details: Mixed,
  ipAddress: String,
  timestamps
}
```

## 🌐 Deployment to Vercel

### 1. Create Vercel Project
```bash
npm install -g vercel
vercel login
vercel
```

### 2. Configure Environment Variables in Vercel Dashboard
- Go to Project Settings → Environment Variables
- Add all `.env.example` variables
- Set `PRODUCTION_BASE_URL` to `https://subscriptions-management-backend.vercel.app`

### 3. Deploy
```bash
vercel --prod
```

### 4. Set Webhook URL
Update your payment provider webhook URL to:
```
https://subscriptions-management-backend.vercel.app/api/webhooks/payment-update
```

## 📝 Example Workflows

### Workflow 1: User Registration and First Purchase
1. User registers via `POST /api/auth/register`
2. Receives JWT token
3. Retrieves available plans via `GET /api/plans`
4. Purchases plan via `POST /api/subscriptions/purchase`
5. Subscription is now active with 30-day expiry

### Workflow 2: Upgrade Subscription
1. User has active Premium plan ($29.99)
2. Sees Premium Pro plan ($39.99)
3. Calls `POST /api/subscriptions/upgrade`
4. Old subscription marked as "upgraded"
5. New subscription created immediately
6. User sees new Premium Pro plan active

### Workflow 3: Admin Views Analytics
1. Admin logs in
2. Calls `GET /api/analytics/dashboard`
3. Views total users, active subscriptions, revenue
4. Calls `GET /api/analytics/subscriptions-by-plan`
5. Sees breakdown of subscription distribution

### Workflow 4: Payment Webhook
1. Payment provider processes payment
2. sends webhook to `/api/webhooks/payment-update` with signature
3. System verifies signature
4. Updates subscription status to 'active'
5. Creates audit log entry

## 🧪 Testing with Postman

1. Import Postman collection (see `postman_collection.json`)
2. Set variable `{{base_url}}` to `http://localhost:5000`
3. Register user, get token
4. Set `{{token}}` variable from login response
5. Test endpoints in order

## 📈 Performance Considerations

- Database indexes on frequently queried fields (email, user_id, plan_id)
- Aggregation pipeline for analytics queries
- Expiring audit logs after 1 year for GDPR compliance
- Proper pagination on audit logs endpoint

## 🐛 Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [array of validation errors]
}
```

## 📞 Support & Documentation

- Swagger/OpenAPI: http://localhost:5000/api-docs
- GitHub: https://github.com/mdhasanshuvo/subscription-management

## 📄 License

ISC

---

**Built with ❤️ for production-quality SaaS applications**

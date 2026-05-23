# Deployment Guide - Vercel

This guide walks through deploying the subscription API to Vercel production.

## Prerequisites

- GitHub repository with the code
- Vercel account (free tier works)
- MongoDB Atlas cluster (already set up)
- Environment variables ready

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git remote add origin https://github.com/mdhasanshuvo/subscription-management.git
git branch -M main
git push -u origin main
```

### 2. Connect Repository to Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### 3. Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables

Add each variable:

```env
MONGODB_URI=mongodb+srv://subscription-management:subscription-management@cluster0.0nnvi.mongodb.net/subscriptionManagementDB

JWT_SECRET=change_this_to_a_secure_random_key_min_32_chars_prod_abc123xyz

JWT_EXPIRE=7d

WEBHOOK_SECRET=change_this_to_secure_webhook_secret_prod_123abc

NODE_ENV=production

PORT=5000
```

**Security Notes**:
- Use strong, random values for JWT_SECRET and WEBHOOK_SECRET
- Never commit these values
- Use different values for production vs staging
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Configure Build Settings

In Vercel:
- **Framework**: Other
- **Build Command**: `npm install`
- **Start Command**: `npm start` (vercel.json handles this)
- **Output Directory**: ./

### 5. Deploy

Click "Deploy" in Vercel dashboard

### 6. Verify Deployment

```bash
# Get your Vercel URL (shown in dashboard)
VERCEL_URL="your-app.vercel.app"

# Test health endpoint
curl https://$VERCEL_URL/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"production"}

# Test Swagger docs
curl https://$VERCEL_URL/api-docs
```

### 7. Update Webhook URL

In your payment provider (Stripe, PayPal, etc.), update webhook endpoint to:

```
https://<your-app>.vercel.app/api/webhooks/payment-update
```

Also update the signature secret to match WEBHOOK_SECRET in .env

### 8. Update Frontend Configuration

If you have a frontend, update API base URL:

```javascript
const API_URL = 'https://<your-app>.vercel.app/api'
```

## Domain Configuration (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (5-10 minutes)

Example: `api.subscription-app.com`

## Monitoring & Scaling

### View Logs

```bash
# Using Vercel CLI
vercel logs <project-name>

# Or through dashboard: Analytics → Function Logs
```

### Monitor Performance

- Vercel dashboard shows:
  - Requests per day
  - Response times
  - Error rates
  - Bandwidth usage

### Scaling

Vercel automatically scales:
- No need to configure servers
- Auto-scaling based on traffic
- Includes 3000 function invocations/month free tier

For high traffic, consider upgrading plan.

## Auto-Deployment

Every push to `main` branch:
1. Vercel automatically triggers deploy
2. Runs build command
3. Checks environment variables
4. Deploys to production if all checks pass

To disable auto-deploy:
- Project Settings → Git → Auto-deploy: Off

## Rollback

To rollback to previous deployment:

1. Go to Deployments tab
2. Find the deployment to revert to
3. Click three dots → Promote to Production

## Database Seeding on Production

**⚠️ Warning**: Seeding on production will reset all data!

If needed:

```bash
# Set NODE_ENV to run seed script
vercel env add NODE_ENV production

# Or manually seed via MongoDB Atlas:
1. Go to MongoDB Atlas cluster
2. Collections → Insert different test data
3. Or run seed.js directly against production DB
```

## Monitoring MongoDB Connection

Check MongoDB connection in production:

```javascript
// Your server logs should show:
// ✓ MongoDB connected successfully
// ✓ Database: subscriptionManagementDB
```

If connection fails:
1. Check MONGODB_URI in environment variables
2. Verify MongoDB Atlas IP whitelist includes Vercel IPs
3. Check cluster status in MongoDB Atlas console

## Performance Optimization

### Database Indexes

Verified in [src/models/](src/models/):
- ✓ User: email index
- ✓ Subscription: user + plan + status compound index
- ✓ Subscription: user + createdAt index
- ✓ SubscriptionPlan: planName index

### Caching (Optional Enhancement)

Consider adding Redis for:
- User session caching
- Plan list caching
- Rate limiting on free tier

```javascript
// Not included in base implementation
// Add if performance becomes issue
```

## Security Checklist

Before production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Change WEBHOOK_SECRET to strong random value
- [ ] Verify .env.example doesn't contain secrets
- [ ] Check .gitignore includes .env
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure CORS origin to frontend URL
- [ ] Update webhook URL in payment provider
- [ ] Test webhook signature validation
- [ ] Review error messages (don't expose internals)
- [ ] Enable MongoDB IP whitelist for Vercel IPs

## Common Issues

### 401 Unauthorized on Production

**Cause**: JWT_SECRET mismatch between local and production

**Fix**: 
1. Verify JWT_SECRET in Vercel environment variables
2. Ensure it's the same value as in test
3. Redeploy after fix

### MongoDB Connection Timeout

**Cause**: MongoDB Atlas IP whitelist doesn't include Vercel IPs

**Fix**:
1. MongoDB Atlas → Network Access
2. Add Vercel IP range or `0.0.0.0/0` (less secure)
3. Or use `ips.vercel.com` list

### Webhook Signature Validation Fails

**Cause**: WEBHOOK_SECRET mismatch

**Fix**:
1. Use exact same secret in Vercel and payment provider
2. Ensure no extra spaces or characters
3. Regenerate and update in both places

### Slow Response Times

**Cause**: Cold start on serverless function

**Fix**:
- Expected: First request ~2-3 seconds
- Subsequent: <100ms
- MongoDB connection pooling helps

## Monitoring Post-Deployment

### Weekly Checklist

- [ ] Check Vercel analytics for errors
- [ ] Monitor MongoDB Atlas connection logs
- [ ] Review audit logs for suspicious activity
- [ ] Check webhook delivery status
- [ ] Test critical API endpoints

### Set Up Alerts (Optional)

Use Vercel integrations:
- Slack notifications for errors
- Datadog for advanced monitoring
- SendGrid for email alerts

Example: Deploy failed → Slack notification

## Maintenance

### Database Backups

MongoDB Atlas provides:
- Automatic daily backups (free tier)
- Point-in-time recovery (paid)
- Manual backup export

### Updating Code

1. Make changes locally
2. Test thoroughly
3. `git push` to main
4. Vercel auto-deploys
5. Verify on production URL

### Updating Dependencies

```bash
npm update           # Non-breaking updates
npm outdated        # See outdated packages
npm audit fix       # Fix security issues
```

Then commit and push.

## Production Performance Targets

- API Response: < 200ms (including DB)
- P95 Response: < 500ms
- Error Rate: < 0.1%
- Availability: > 99.9%

Monitor in Vercel Analytics tab.

## FAQ

**Q: How much does Vercel cost?**
A: Free tier covers most use cases. $20/month upgrade for more functions.

**Q: Can I rollback a bad deploy?**
A: Yes, use Deployments tab → Promote previous version

**Q: Does Vercel scale automatically?**
A: Yes, automatically handles traffic spikes

**Q: Can I use custom domain?**
A: Yes, add in Project Settings → Domains

**Q: How do I see production logs?**
A: Dashboard → Analytics → Function Logs, or `vercel logs`

**Q: What if I hit function limits?**
A: Upgrade plan or optimize code (cache, indexes, etc.)

---

**Deployment Complete!** 🎉

Your API is now live and accessible at:
```
https://<your-vercel-app>.vercel.app
```

Test with:
```bash
curl https://<your-vercel-app>.vercel.app/health
```

Update your frontend to use the production API URL.

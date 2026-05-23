# Business Logic Documentation

## Core System Rules

This document outlines the critical business logic that powers the subscription system.

### RULE 1: Prevent Duplicate Active Subscriptions

**Scenario**: User already has an active subscription for the same plan

**Logic Flow**:
```javascript
// Check in subscriptionService.createSubscription()
const hasDuplicate = await hasActiveSubscriptionForPlan(userId, planId);
if (hasDuplicate) {
  throw "You already have an active subscription for this plan"
}
```

**Behavior**:
- User A buys "Professional" plan ✓ (success)
- User A tries to buy "Professional" again ✗ (rejected: duplicate)
- User A can still upgrade to "Enterprise" ✓ (different plan)

**Code Implementation**: [src/services/subscriptionService.js](src/services/subscriptionService.js#L13)

---

### RULE 2: Upgrade to Higher Priced Plan

**Scenario**: User wants better features with higher price

**Upgrade Process**:
1. User has active subscription for Plan A ($29.99)
2. User wants to upgrade to Plan B ($99.99)
3. Old subscription marked as "upgraded"
4. New subscription created immediately with new expiry
5. Full history preserved with relationship tracking

**Logic Verification**:
```javascript
if (newPlan.price <= oldSubscription.plan.price) {
  throw "New plan must be higher priced for upgrade"
}
```

**State Changes**:
- Old Subscription: status = "upgraded", upgradedTo = newSubscription._id
- New Subscription: previousSubscription = oldSubscription._id

**Example**:
```
Time: 2025-05-23
├─ Professional Plan ($29.99) - Purchased
├─ User requests upgrade to Enterprise
├─ OLD: Professional → Status: "upgraded"
└─ NEW: Enterprise ($99.99) → Status: "active"

History preserved: Professional → upgraded → Enterprise
```

**Code Implementation**: [src/services/subscriptionService.js](src/services/subscriptionService.js#L99)

---

### RULE 3: Downgrade to Lower Priced Plan

**Scenario**: User wants simpler plan with lower cost

**Downgrade Process** (Simple Immediate Approach):
1. User has active "Enterprise" ($99.99)
2. User wants "Professional" ($29.99)
3. Old subscription marked as "downgraded"
4. New subscription created **immediately** (full reset of duration)
5. User gets new 30-day (or configured) period

**Why Immediate?**:
- Simpler mental model for users
- Easier to explain in interviews
- Clear state transitions
- No complicated date calculations

**Logic Verification**:
```javascript
if (newPlan.price >= oldSubscription.plan.price) {
  throw "New plan must be lower priced for downgrade"
}
```

**State Changes**:
- Old Subscription: status = "downgraded", downgradedTo = newSubscription._id
- New Subscription: previousSubscription = oldSubscription._id

**Alternative Approach** (Not implemented):
```javascript
// Could apply downgrade after current expiry (complex)
// Not chosen because interview explanation is harder
// "When does it apply exactly? What about prorations?"
```

**Code Implementation**: [src/services/subscriptionService.js](src/services/subscriptionService.js#L142)

---

### RULE 4: Automatic Expiry Handling

**Scenario**: User's subscription reaches expiration date

**Expiry Mechanics**:
```javascript
// In Subscription model
subscriptionSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

subscriptionSchema.methods.isActive = function () {
  // Active if status='active' AND not past expiry
  return this.status === 'active' && !this.isExpired();
};
```

**Flow**:
1. Subscription created with expiryDate = startDate + durationInDays
2. When system checks subscription status, isExpired() calculates on-the-fly
3. If past expiry, treated as expired in responses
4. Status field updated during subscription retrieval

**Example Timeline**:
```
Created: 2025-05-23
Duration: 30 days
Expiry: 2025-06-22

2025-06-21 08:00 → Status: "active", isActive() = true ✓
2025-06-22 23:59 → Status: "active", isActive() = true ✓
2025-06-23 00:01 → Status: "active", isActive() = false ✗ (expired)
```

**Code Implementation**: [src/models/Subscription.js](src/models/Subscription.js#L86-L94)

---

### RULE 5: No Multiple Active Subscriptions Simultaneously

**Scenario**: Prevent users from having multiple active subscriptions at once

**Enforcement**:
```javascript
// In subscriptionService.createSubscription()
const existingActive = await getUserActiveSubscription(userId);
if (existingActive) {
  throw "You already have an active subscription. Cancel it or upgrade/downgrade"
}
```

**Allowed Scenarios**:
- 1 active subscription ✓
- 1 active + 1 expired ✓
- 1 active + 1 cancelled ✓
- 1 active + 1 upgraded (old) ✓

**Prevented Scenarios**:
- 2 active subscriptions ✗
- User has Premium (active) + tries to buy Starter (active) ✗

**Query Used**:
```javascript
db.subscriptions.findOne({
  user: userId,
  status: 'active'
})
```

**Code Implementation**: [src/services/subscriptionService.js](src/services/subscriptionService.js#L28)

---

## Subscription Lifecycle States

```
┌──────────┐
│  ACTIVE  │  ← User's current subscription
└──────────┘
    │     
    ├─→ EXPIRED (past expiryDate OR status='expired') 
    │   └─→ User can purchase new plan
    │
    ├─→ UPGRADED (user upgraded to higher plan)
    │   └─→ History tracked, old subscription preserved
    │
    ├─→ DOWNGRADED (user downgraded to lower plan)
    │   └─→ New subscription starts immediately
    │
    └─→ CANCELLED (user requested cancellation)
        └─→ Reason and timestamp recorded
```

---

## Data Integrity Features

### 1. MongoDB Indexes
```javascript
// Prevent duplicate active subscriptions for same plan
subscriptionSchema.index({ user: 1, plan: 1, status: 1 });

// Fast user subscription lookups
subscriptionSchema.index({ user: 1, createdAt: -1 });

// Email uniqueness
userSchema.index({ email: 1 });
```

### 2. Historical Tracking
Every subscription change creates:
- New subscription record (with ID)
- Link to previous subscription
- AuditLog entry
- Timestamp of change

**Example**:
```javascript
// Original subscription
Sub A (Professional, $29.99)
  ├─ status: 'upgraded'
  ├─ upgradedTo: Sub B
  └─ createdAt: 2025-05-23

// New subscription after upgrade
Sub B (Enterprise, $99.99)
  ├─ status: 'active'
  ├─ previousSubscription: Sub A
  └─ createdAt: 2025-05-23 (same time)
```

### 3. Audit Logging
Every action creates audit log:
```javascript
await AuditLog.create({
  user: userId,
  action: 'subscription_upgraded',
  subscription: newSubId,
  details: {
    fromPrice: 29.99,
    toPrice: 99.99,
    priceDifference: 70.00
  },
  ipAddress: req.ip
});
```

---

## Payment Integration (Webhook)

### Webhook Events

**1. payment_success**
```javascript
// Triggered when payment provider confirms payment
event: 'payment_success'
subscription.status = 'active'
// Subscription now fully activated
```

**2. payment_failed**
```javascript
// Triggered when payment provider denies payment
event: 'payment_failed'
subscription.status = 'cancelled'
// Subscription automatically cancelled
```

**3. renewal_success**
```javascript
// Triggered when subscription auto-renewal succeeds
event: 'renewal_success'
// Creates NEW subscription
// Old subscription remains as history
```

### Webhook Security
```javascript
// HMAC SHA256 signature verification
const expectedSignature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

if (signature !== expectedSignature) {
  throw "Invalid webhook signature"
}
```

---

## Interview Explanation Example

**Q**: "Walk me through what happens when a user upgrades their subscription"

**A**: 
> "Here's the flow: First, we validate that the new plan has a higher price than their current plan. Then, we create a brand new subscription record with the new plan, starting immediately with a fresh timer.
>
> The old subscription gets marked with status 'upgraded' and we create a link from the old to the new one via the upgradedTo field. This preserves the complete history.
>
> We also create an audit log entry that tracks the action, the price difference, and when it happened.
>
> The key business rule here is: we don't allow multiple active subscriptions simultaneously. So the user's 'active' subscription smoothly transitions from the old plan to the new one through these atomic changes."

---

## Performance Considerations

### Query Optimization
```javascript
// Fast: Uses index on (user, plan, status)
db.subscriptions.findOne({ user: userId, plan: planId, status: 'active' })

// Slow: Multiple scans
db.subscriptions.find({ user: userId }).then(filter by status)
```

### Aggregation Pipeline
```javascript
// Analytics use aggregation for efficiency
db.subscriptions.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$plan', count: { $sum: 1 } } },
  { $lookup: { from: 'plans', ... } }
])
```

---

## Error Handling Examples

```javascript
// Rule 1 Violation
400 Bad Request
{
  "success": false,
  "message": "You already have an active subscription for this plan"
}

// Rule 2 Violation (Downgrade attempt)
400 Bad Request
{
  "success": false,
  "message": "New plan must be higher priced for upgrade"
}

// Rule 5 Violation
400 Bad Request
{
  "success": false,
  "message": "You already have an active subscription. Cancel it or upgrade/downgrade"
}
```

---

## Testing the Business Logic

### Unit Test Concepts
```javascript
// Test Rule 1
it('should prevent duplicate active subscriptions for same plan', async () => {
  await subscriptionService.createSubscription(userId, planId1);
  await expect(
    subscriptionService.createSubscription(userId, planId1)
  ).rejects.toThrow('You already have an active subscription for this plan');
});

// Test Rule 2
it('should allow upgrade to higher priced plan', async () => {
  const sub1 = await subscriptionService.createSubscription(userId, cheapPlanId);
  const sub2 = await subscriptionService.upgradeSubscription(
    userId, sub1._id, expensivePlanId
  );
  expect(sub1.status).toBe('upgraded');
  expect(sub2.status).toBe('active');
});

// Test Rule 4
it('should mark expired subscriptions', async () => {
  const sub = await subscriptionService.createSubscription(userId, planId);
  sub.expiryDate = new Date(Date.now() - 1000); // Past
  expect(sub.isExpired()).toBe(true);
  expect(sub.isActive()).toBe(false);
});
```

---

## Summary Table

| Rule | Constraint | Enforcement | Example |
|------|-----------|-------------|---------|
| 1 | No duplicate active subs for same plan | Check before create | Can't buy same plan twice |
| 2 | Upgrade only to higher price | Price comparison | $29.99 → $99.99 ✓ |
| 3 | Downgrade only to lower price | Price comparison | $99.99 → $29.99 ✓ |
| 4 | Automatic expiry tracking | isExpired() method | Past expiryDate = expired |
| 5 | No multiple active subs | getActiveSubscription() check | Max 1 active at a time |


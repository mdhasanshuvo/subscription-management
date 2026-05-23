const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const AuditLog = require('../models/AuditLog');

/**
 * Check if user has active subscription for given plan
 * RULE 1: Prevent duplicate active subscriptions for same plan
 */
const hasActiveSubscriptionForPlan = async (userId, planId) => {
  const activeSubscription = await Subscription.findOne({
    user: userId,
    plan: planId,
    status: 'active',
  });

  return !!activeSubscription;
};

/**
 * Check if user has any active subscription
 * RULE 5: Prevent multiple active subscriptions simultaneously
 */
const getUserActiveSubscription = async (userId) => {
  const activeSubscriptions = await Subscription.find({
    user: userId,
    status: 'active',
  }).populate('plan');

  // Filter out expired subscriptions
  const validActiveSubscriptions = activeSubscriptions.filter(
    (sub) => !sub.isExpired()
  );

  return validActiveSubscriptions.length > 0 ? validActiveSubscriptions[0] : null;
};

/**
 * Calculate expiry date based on duration
 */
const calculateExpiryDate = (durationInDays) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationInDays);
  return expiryDate;
};

/**
 * Create new subscription
 * Prevents duplicate active subscriptions
 */
const createSubscription = async (userId, planId, ipAddress = null) => {
  // Get plan details
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    throw {
      statusCode: 404,
      message: 'Plan not found',
    };
  }

  // RULE 1: Check for duplicate active subscription for same plan
  const hasDuplicate = await hasActiveSubscriptionForPlan(userId, planId);
  if (hasDuplicate) {
    throw {
      statusCode: 400,
      message: 'You already have an active subscription for this plan',
    };
  }

  // RULE 5: Check if user already has another active subscription
  const existingActive = await getUserActiveSubscription(userId);
  if (existingActive) {
    throw {
      statusCode: 400,
      message: 'You already have an active subscription. Cancel it or upgrade/downgrade',
    };
  }

  // Create subscription
  const startDate = new Date();
  const expiryDate = calculateExpiryDate(plan.durationInDays);

  const subscription = new Subscription({
    user: userId,
    plan: planId,
    priceAtPurchase: plan.price,
    startDate,
    expiryDate,
    status: 'active',
    autoRenew: false,
  });

  await subscription.save();

  // Log action
  await AuditLog.create({
    user: userId,
    action: 'subscription_created',
    subscription: subscription._id,
    plan: planId,
    details: {
      price: plan.price,
      duration: plan.durationInDays,
    },
    ipAddress,
  });

  return subscription;
};

/**
 * Upgrade subscription to higher priced plan
 * RULE 2: Allow upgrading to HIGHER priced plan
 */
const upgradeSubscription = async (userId, oldSubscriptionId, newPlanId, ipAddress = null) => {
  // Get old subscription
  const oldSubscription = await Subscription.findById(oldSubscriptionId).populate('plan');
  if (!oldSubscription) {
    throw {
      statusCode: 404,
      message: 'Current subscription not found',
    };
  }

  // Verify user owns this subscription
  if (oldSubscription.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'You do not own this subscription',
    };
  }

  // Get new plan
  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan) {
    throw {
      statusCode: 404,
      message: 'New plan not found',
    };
  }

  // Check if new plan price is higher (upgrade logic)
  if (newPlan.price <= oldSubscription.plan.price) {
    throw {
      statusCode: 400,
      message: 'New plan must be higher priced for upgrade',
    };
  }

  // Create new subscription
  const startDate = new Date();
  const expiryDate = calculateExpiryDate(newPlan.durationInDays);

  const newSubscription = new Subscription({
    user: userId,
    plan: newPlanId,
    priceAtPurchase: newPlan.price,
    startDate,
    expiryDate,
    status: 'active',
    autoRenew: false,
    previousSubscription: oldSubscriptionId,
  });

  await newSubscription.save();

  // Mark old subscription as upgraded
  oldSubscription.status = 'upgraded';
  oldSubscription.upgradedTo = newSubscription._id;
  await oldSubscription.save();

  // Log action
  await AuditLog.create({
    user: userId,
    action: 'subscription_upgraded',
    subscription: newSubscription._id,
    plan: newPlanId,
    details: {
      fromPlan: oldSubscription.plan._id,
      fromPrice: oldSubscription.plan.price,
      toPrice: newPlan.price,
      priceDifference: newPlan.price - oldSubscription.plan.price,
    },
    ipAddress,
  });

  return newSubscription;
};

/**
 * Downgrade subscription to lower priced plan
 * RULE 3: Allow downgrade to LOWER priced plan
 * Strategy: Apply downgrade immediately (simple approach)
 */
const downgradeSubscription = async (userId, oldSubscriptionId, newPlanId, ipAddress = null) => {
  // Get old subscription
  const oldSubscription = await Subscription.findById(oldSubscriptionId).populate('plan');
  if (!oldSubscription) {
    throw {
      statusCode: 404,
      message: 'Current subscription not found',
    };
  }

  // Verify user owns this subscription
  if (oldSubscription.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'You do not own this subscription',
    };
  }

  // Get new plan
  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan) {
    throw {
      statusCode: 404,
      message: 'New plan not found',
    };
  }

  // Check if new plan price is lower (downgrade logic)
  if (newPlan.price >= oldSubscription.plan.price) {
    throw {
      statusCode: 400,
      message: 'New plan must be lower priced for downgrade',
    };
  }

  // Create new subscription
  // Apply downgrade immediately (simple approach)
  const startDate = new Date();
  const expiryDate = calculateExpiryDate(newPlan.durationInDays);

  const newSubscription = new Subscription({
    user: userId,
    plan: newPlanId,
    priceAtPurchase: newPlan.price,
    startDate,
    expiryDate,
    status: 'active',
    autoRenew: false,
    previousSubscription: oldSubscriptionId,
  });

  await newSubscription.save();

  // Mark old subscription as downgraded
  oldSubscription.status = 'downgraded';
  oldSubscription.downgradedTo = newSubscription._id;
  await oldSubscription.save();

  // Log action
  await AuditLog.create({
    user: userId,
    action: 'subscription_downgraded',
    subscription: newSubscription._id,
    plan: newPlanId,
    details: {
      fromPlan: oldSubscription.plan._id,
      fromPrice: oldSubscription.plan.price,
      toPrice: newPlan.price,
      priceDifference: oldSubscription.plan.price - newPlan.price,
    },
    ipAddress,
  });

  return newSubscription;
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (userId, subscriptionId, cancellationReason, ipAddress = null) => {
  // Get subscription
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw {
      statusCode: 404,
      message: 'Subscription not found',
    };
  }

  // Verify user owns this subscription
  if (subscription.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'You do not own this subscription',
    };
  }

  // Cannot cancel already cancelled subscription
  if (subscription.status === 'cancelled') {
    throw {
      statusCode: 400,
      message: 'Subscription is already cancelled',
    };
  }

  // Update subscription
  subscription.status = 'cancelled';
  subscription.cancellationReason = cancellationReason;
  subscription.cancelledAt = new Date();
  await subscription.save();

  // Log action
  await AuditLog.create({
    user: userId,
    action: 'subscription_cancelled',
    subscription: subscription._id,
    details: {
      reason: cancellationReason,
    },
    ipAddress,
  });

  return subscription;
};

/**
 * Get user subscription history (all subscriptions including expired/cancelled)
 */
const getUserSubscriptionHistory = async (userId) => {
  const subscriptions = await Subscription.find({ user: userId })
    .populate('plan', 'planName price durationInDays features')
    .sort({ createdAt: -1 });

  return subscriptions;
};

module.exports = {
  hasActiveSubscriptionForPlan,
  getUserActiveSubscription,
  calculateExpiryDate,
  createSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  getUserSubscriptionHistory,
};

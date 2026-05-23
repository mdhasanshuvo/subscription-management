const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: [true, 'Plan is required'],
      index: true,
    },
    priceAtPurchase: {
      type: Number,
      required: [true, 'Price at purchase is required'],
      min: [0, 'Price cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    // Subscription status: Active, Expired, Cancelled, Upgraded, Downgraded
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'upgraded', 'downgraded'],
      default: 'active',
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    // Track if this subscription was upgraded/downgraded to another
    upgradedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    downgradedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    // Previous subscription (in case of upgrade/downgrade)
    previousSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    // Track cancellation reason
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate active subscriptions for same user and plan
subscriptionSchema.index({ user: 1, plan: 1, status: 1 });

// Index for user's subscriptions
subscriptionSchema.index({ user: 1, createdAt: -1 });

// Helper method to check if subscription is expired
subscriptionSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

// Helper method to check if subscription is still active
subscriptionSchema.methods.isActive = function () {
  // Active if status is 'active' AND not past expiry date
  return this.status === 'active' && !this.isExpired();
};

// Helper method to get expiry days remaining
subscriptionSchema.methods.getDaysRemaining = function () {
  if (this.isExpired()) {
    return 0;
  }
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((this.expiryDate - new Date()) / msInDay);
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

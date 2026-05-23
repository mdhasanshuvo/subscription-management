const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'subscription_created',
        'subscription_upgraded',
        'subscription_downgraded',
        'subscription_cancelled',
        'subscription_renewed',
        'webhook_payment_success',
        'webhook_payment_failed',
      ],
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Expiring log after 1 year for GDPR compliance
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Index for faster user action lookups
auditLogSchema.index({ user: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

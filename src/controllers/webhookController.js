const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const subscriptionService = require('../services/subscriptionService');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Verify webhook signature for security
 * This prevents fake webhook requests
 */
const verifyWebhookSignature = (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
};

/**
 * Handle webhook payment updates
 * POST /webhooks/payment-update
 * 
 * Webhook payload can be:
 * 1. payment_success: Update subscription status
 * 2. payment_failed: Mark as failed
 * 3. renewal_success: Renew subscription
 */
const handlePaymentUpdate = async (req, res, next) => {
  try {
    const { event, subscriptionId, status, timestamp } = req.body;
    const signature = req.headers['x-webhook-signature'];

    // Validate webhook secret
    const rawPayload = req.rawBody || Buffer.from(JSON.stringify(req.body));

    if (!signature || !verifyWebhookSignature(rawPayload, signature)) {
      return res.status(401).json(
        formatErrorResponse('Invalid webhook signature', 401)
      );
    }

    // Validate required fields
    if (!event || !subscriptionId) {
      return res.status(400).json(
        formatErrorResponse('event and subscriptionId are required', 400)
      );
    }

    // Find subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json(
        formatErrorResponse('Subscription not found', 404)
      );
    }

    let result = null;

    // Handle payment success
    if (event === 'payment_success') {
      const previousStatus = subscription.status;
      subscription.status = 'active';
      await subscription.save();

      // Log action
      await AuditLog.create({
        user: subscription.user,
        action: 'webhook_payment_success',
        subscription: subscription._id,
        details: {
          event,
          previousStatus,
        },
      });

      result = {
        action: 'payment_success',
        subscription,
      };
    }

    // Handle payment failed
    if (event === 'payment_failed') {
      const previousStatus = subscription.status;
      subscription.status = 'cancelled';
      await subscription.save();

      // Log action
      await AuditLog.create({
        user: subscription.user,
        action: 'webhook_payment_failed',
        subscription: subscription._id,
        details: {
          event,
          previousStatus,
        },
      });

      result = {
        action: 'payment_failed',
        subscription,
      };
    }

    // Handle renewal
    if (event === 'renewal_success') {
      const plan = await Subscription.findById(subscriptionId).populate('plan');
      
      // Create new subscription for renewal
      const newSubscription = new Subscription({
        user: subscription.user,
        plan: subscription.plan,
        priceAtPurchase: subscription.priceAtPurchase,
        startDate: new Date(),
        expiryDate: subscriptionService.calculateExpiryDate(plan.plan.durationInDays),
        status: 'active',
        autoRenew: subscription.autoRenew,
        previousSubscription: subscription._id,
      });

      await newSubscription.save();

      // Log action
      await AuditLog.create({
        user: subscription.user,
        action: 'subscription_renewed',
        subscription: newSubscription._id,
        details: {
          event,
          previousSubscriptionId: subscription._id,
        },
      });

      result = {
        action: 'renewal_success',
        subscription: newSubscription,
      };
    }

    if (!result) {
      return res.status(400).json(
        formatErrorResponse('Unknown event type', 400)
      );
    }

    res.status(200).json(
      formatSuccessResponse('Webhook processed successfully', result)
    );
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
};

/**
 * Test webhook endpoint (for development)
 * POST /webhooks/test
 */
const testWebhook = async (req, res, next) => {
  try {
    const { subscriptionId, event } = req.body;

    if (!subscriptionId || !event) {
      return res.status(400).json(
        formatErrorResponse('subscriptionId and event are required', 400)
      );
    }

    // Create test signature
    const testPayload = {
      event,
      subscriptionId,
      timestamp: new Date(),
    };

    const testSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(testPayload))
      .digest('hex');

    res.status(200).json(
      formatSuccessResponse('Test webhook created', {
        webhook: testPayload,
        signature: testSignature,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handlePaymentUpdate,
  testWebhook,
  verifyWebhookSignature,
};

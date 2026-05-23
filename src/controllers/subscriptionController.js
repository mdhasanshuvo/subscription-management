const Subscription = require('../models/Subscription');
const subscriptionService = require('../services/subscriptionService');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Purchase new subscription
 * POST /api/subscriptions/purchase
 */
const purchaseSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    if (!planId) {
      return res.status(400).json(
        formatErrorResponse('Plan ID is required', 400)
      );
    }

    const subscription = await subscriptionService.createSubscription(
      userId,
      planId,
      ipAddress
    );

    // Populate full details
    await subscription.populate('plan', 'planName price durationInDays features');

    res.status(201).json(
      formatSuccessResponse('Subscription purchased successfully', subscription)
    );
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatErrorResponse(error.message, error.statusCode)
      );
    }
    next(error);
  }
};

/**
 * Get user's current active subscription
 * GET /api/subscriptions/active
 */
const getActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const subscription = await subscriptionService.getUserActiveSubscription(userId);

    if (!subscription) {
      return res.status(200).json(
        formatSuccessResponse('No active subscription found', null)
      );
    }

    // Check if expired and update status
    if (subscription.isExpired()) {
      subscription.status = 'expired';
      await subscription.save();
      return res.status(200).json(
        formatSuccessResponse('No active subscription found', null)
      );
    }

    await subscription.populate('plan', 'planName price durationInDays features');

    res.status(200).json(
      formatSuccessResponse('Active subscription retrieved successfully', subscription)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription by ID
 * GET /api/subscriptions/:id
 */
const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const subscription = await Subscription.findById(id).populate('plan');

    if (!subscription) {
      return res.status(404).json(
        formatErrorResponse('Subscription not found', 404)
      );
    }

    // Check if user owns this subscription or is admin
    if (req.user.role !== 'admin' && subscription.user.toString() !== userId.toString()) {
      return res.status(403).json(
        formatErrorResponse('You do not have permission to view this subscription', 403)
      );
    }

    res.status(200).json(
      formatSuccessResponse('Subscription retrieved successfully', subscription)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subscriptions for user (history)
 * GET /api/subscriptions/history
 */
const getSubscriptionHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const subscriptions = await subscriptionService.getUserSubscriptionHistory(userId);

    res.status(200).json(
      formatSuccessResponse('Subscription history retrieved successfully', subscriptions)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upgrade subscription to higher priced plan
 * POST /api/subscriptions/upgrade
 */
const upgradeSubscription = async (req, res, next) => {
  try {
    const { currentSubscriptionId, newPlanId } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    if (!currentSubscriptionId || !newPlanId) {
      return res.status(400).json(
        formatErrorResponse('currentSubscriptionId and newPlanId are required', 400)
      );
    }

    const newSubscription = await subscriptionService.upgradeSubscription(
      userId,
      currentSubscriptionId,
      newPlanId,
      ipAddress
    );

    await newSubscription.populate('plan', 'planName price durationInDays features');

    res.status(201).json(
      formatSuccessResponse('Subscription upgraded successfully', newSubscription)
    );
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatErrorResponse(error.message, error.statusCode)
      );
    }
    next(error);
  }
};

/**
 * Downgrade subscription to lower priced plan
 * POST /api/subscriptions/downgrade
 */
const downgradeSubscription = async (req, res, next) => {
  try {
    const { currentSubscriptionId, newPlanId } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    if (!currentSubscriptionId || !newPlanId) {
      return res.status(400).json(
        formatErrorResponse('currentSubscriptionId and newPlanId are required', 400)
      );
    }

    const newSubscription = await subscriptionService.downgradeSubscription(
      userId,
      currentSubscriptionId,
      newPlanId,
      ipAddress
    );

    await newSubscription.populate('plan', 'planName price durationInDays features');

    res.status(201).json(
      formatSuccessResponse('Subscription downgraded successfully', newSubscription)
    );
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatErrorResponse(error.message, error.statusCode)
      );
    }
    next(error);
  }
};

/**
 * Cancel subscription
 * POST /api/subscriptions/:id/cancel
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const subscription = await subscriptionService.cancelSubscription(
      userId,
      id,
      reason || 'User requested cancellation',
      ipAddress
    );

    await subscription.populate('plan', 'planName price durationInDays features');

    res.status(200).json(
      formatSuccessResponse('Subscription cancelled successfully', subscription)
    );
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        formatErrorResponse(error.message, error.statusCode)
      );
    }
    next(error);
  }
};

module.exports = {
  purchaseSubscription,
  getActiveSubscription,
  getSubscriptionById,
  getSubscriptionHistory,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
};

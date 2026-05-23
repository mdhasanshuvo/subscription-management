const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @swagger
 * /api/subscriptions/purchase:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Purchase new subscription
 *     description: Purchase a new subscription plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription purchased successfully
 *       400:
 *         description: Invalid input or duplicate subscription
 */
router.post(
  '/purchase',
  authenticateToken,
  body('planId').notEmpty().isMongoId(),
  validateInput,
  subscriptionController.purchaseSubscription
);

/**
 * @swagger
 * /api/subscriptions/active:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get active subscription
 *     description: Retrieve current active subscription for logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription retrieved successfully
 */
router.get('/active', authenticateToken, subscriptionController.getActiveSubscription);

/**
 * @swagger
 * /api/subscriptions/history:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get subscription history
 *     description: Retrieve all subscriptions for logged-in user (active, expired, cancelled)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history retrieved successfully
 */
router.get('/history', authenticateToken, subscriptionController.getSubscriptionHistory);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get subscription by ID
 *     description: Retrieve a specific subscription (user can only see their own unless admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       404:
 *         description: Subscription not found
 */
router.get('/:id', authenticateToken, subscriptionController.getSubscriptionById);

/**
 * @swagger
 * /api/subscriptions/upgrade:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Upgrade subscription
 *     description: Upgrade to a higher priced plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentSubscriptionId
 *               - newPlanId
 *             properties:
 *               currentSubscriptionId:
 *                 type: string
 *               newPlanId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription upgraded successfully
 *       400:
 *         description: Invalid input or cannot upgrade (new plan must be higher priced)
 */
router.post(
  '/upgrade',
  authenticateToken,
  body('currentSubscriptionId').notEmpty().isMongoId(),
  body('newPlanId').notEmpty().isMongoId(),
  validateInput,
  subscriptionController.upgradeSubscription
);

/**
 * @swagger
 * /api/subscriptions/downgrade:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Downgrade subscription
 *     description: Downgrade to a lower priced plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentSubscriptionId
 *               - newPlanId
 *             properties:
 *               currentSubscriptionId:
 *                 type: string
 *               newPlanId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription downgraded successfully
 *       400:
 *         description: Invalid input or cannot downgrade (new plan must be lower priced)
 */
router.post(
  '/downgrade',
  authenticateToken,
  body('currentSubscriptionId').notEmpty().isMongoId(),
  body('newPlanId').notEmpty().isMongoId(),
  validateInput,
  subscriptionController.downgradeSubscription
);

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Cancel subscription
 *     description: Cancel active subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       404:
 *         description: Subscription not found
 */
router.post(
  '/:id/cancel',
  authenticateToken,
  subscriptionController.cancelSubscription
);

module.exports = router;

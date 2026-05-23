const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const webhookController = require('../controllers/webhookController');

// Validation middleware
const validateWebhookInput = (req, res, next) => {
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
 * /api/webhooks/payment-update:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Handle payment webhook
 *     description: Process payment updates from payment provider. Requires webhook signature validation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - subscriptionId
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [payment_success, payment_failed, renewal_success]
 *               subscriptionId:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     parameters:
 *       - in: header
 *         name: x-webhook-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC SHA256 signature of the webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Invalid webhook signature
 *       404:
 *         description: Subscription not found
 */
router.post(
  '/payment-update',
  body('event').notEmpty().isIn(['payment_success', 'payment_failed', 'renewal_success']),
  body('subscriptionId').notEmpty().isMongoId(),
  validateWebhookInput,
  webhookController.handlePaymentUpdate
);

/**
 * @swagger
 * /api/webhooks/test:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Generate test webhook
 *     description: Create a test webhook payload and signature for development
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *               - event
 *             properties:
 *               subscriptionId:
 *                 type: string
 *               event:
 *                 type: string
 *                 enum: [payment_success, payment_failed, renewal_success]
 *     responses:
 *       200:
 *         description: Test webhook generated
 */
router.post(
  '/test',
  body('subscriptionId').notEmpty().isMongoId(),
  body('event').notEmpty().isIn(['payment_success', 'payment_failed', 'renewal_success']),
  validateWebhookInput,
  webhookController.testWebhook
);

module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/rbac');

// All analytics endpoints require authentication and admin role
router.use(authenticateToken, authorizeRole('admin'));

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get dashboard analytics
 *     description: Retrieve admin dashboard analytics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

/**
 * @swagger
 * /api/analytics/subscriptions-by-plan:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get subscriptions by plan
 *     description: Breakdown of active subscriptions by plan (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions breakdown retrieved successfully
 */
router.get('/subscriptions-by-plan', analyticsController.getSubscriptionsByPlan);

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get revenue analysis
 *     description: Revenue breakdown and statistics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue analysis retrieved successfully
 */
router.get('/revenue', analyticsController.getRevenueAnalysis);

/**
 * @swagger
 * /api/analytics/user-growth:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get user growth analytics
 *     description: User growth and conversion metrics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User growth data retrieved successfully
 */
router.get('/user-growth', analyticsController.getUserGrowth);

/**
 * @swagger
 * /api/analytics/audit-logs:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get audit logs
 *     description: Retrieve system audit logs (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', analyticsController.getAuditLogs);

module.exports = router;

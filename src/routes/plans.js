const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const planController = require('../controllers/planController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/rbac');

// Validation middleware
const validatePlanInput = (req, res, next) => {
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
 * /api/plans:
 *   get:
 *     tags:
 *       - Plans
 *     summary: Get all subscription plans
 *     description: Retrieve all active subscription plans
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter only active plans
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 */
router.get('/', planController.getAllPlans);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     tags:
 *       - Plans
 *     summary: Get plan by ID
 *     description: Retrieve a specific subscription plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *       404:
 *         description: Plan not found
 */
router.get('/:id', planController.getPlanById);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     tags:
 *       - Plans
 *     summary: Create new plan
 *     description: Create a new subscription plan (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planName
 *               - price
 *               - durationInDays
 *             properties:
 *               planName:
 *                 type: string
 *               price:
 *                 type: number
 *               durationInDays:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  body('planName').notEmpty().trim().isLength({ min: 2 }),
  body('price').isFloat({ min: 0 }),
  body('durationInDays').isInt({ min: 1 }),
  validatePlanInput,
  planController.createPlan
);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     tags:
 *       - Plans
 *     summary: Update plan
 *     description: Update a subscription plan (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planName:
 *                 type: string
 *               price:
 *                 type: number
 *               durationInDays:
 *                 type: number
 *               features:
 *                 type: array
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  planController.updatePlan
);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     tags:
 *       - Plans
 *     summary: Delete plan
 *     description: Delete a subscription plan (Admin only)
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
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  planController.deletePlan
);

module.exports = router;

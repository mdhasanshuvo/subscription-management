const SubscriptionPlan = require('../models/SubscriptionPlan');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Get all subscription plans
 * GET /api/plans
 */
const getAllPlans = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;

    let filter = {};
    if (activeOnly === 'true') {
      filter.activeStatus = true;
    }

    const plans = await SubscriptionPlan.find(filter).sort({ price: 1 });

    res.status(200).json(
      formatSuccessResponse('Plans retrieved successfully', plans)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single plan by ID
 * GET /api/plans/:id
 */
const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json(
        formatErrorResponse('Plan not found', 404)
      );
    }

    res.status(200).json(
      formatSuccessResponse('Plan retrieved successfully', plan)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new subscription plan (Admin only)
 * POST /api/plans
 */
const createPlan = async (req, res, next) => {
  try {
    const { planName, price, durationInDays, features, activeStatus } = req.body;

    // Validate input
    if (!planName || price === undefined || !durationInDays) {
      return res.status(400).json(
        formatErrorResponse('planName, price, and durationInDays are required', 400)
      );
    }

    // Validate price is positive
    if (price < 0) {
      return res.status(400).json(
        formatErrorResponse('Price must be positive', 400)
      );
    }

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ planName });
    if (existingPlan) {
      return res.status(400).json(
        formatErrorResponse('Plan with this name already exists', 400)
      );
    }

    const newPlan = new SubscriptionPlan({
      planName,
      price,
      durationInDays,
      features: features || [],
      activeStatus: activeStatus !== false,
    });

    await newPlan.save();

    res.status(201).json(
      formatSuccessResponse('Plan created successfully', newPlan)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription plan (Admin only)
 * PUT /api/plans/:id
 */
const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planName, price, durationInDays, features, activeStatus } = req.body;

    // Find plan
    let plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json(
        formatErrorResponse('Plan not found', 404)
      );
    }

    // Check if updating plan name to existing name
    if (planName && planName !== plan.planName) {
      const existingPlan = await SubscriptionPlan.findOne({ planName });
      if (existingPlan) {
        return res.status(400).json(
          formatErrorResponse('Plan with this name already exists', 400)
        );
      }
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json(
        formatErrorResponse('Price must be positive', 400)
      );
    }

    // Update fields
    if (planName) plan.planName = planName;
    if (price !== undefined) plan.price = price;
    if (durationInDays) plan.durationInDays = durationInDays;
    if (features) plan.features = features;
    if (activeStatus !== undefined) plan.activeStatus = activeStatus;

    await plan.save();

    res.status(200).json(
      formatSuccessResponse('Plan updated successfully', plan)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete subscription plan (Admin only)
 * DELETE /api/plans/:id
 */
const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json(
        formatErrorResponse('Plan not found', 404)
      );
    }

    res.status(200).json(
      formatSuccessResponse('Plan deleted successfully', plan)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};

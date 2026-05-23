/**
 * Enhanced Response Utilities
 * Provides advanced response formatting with pagination and metadata
 */

const formatSuccessResponse = (message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

const formatPaginatedResponse = (message, data, pagination) => {
  return formatSuccessResponse(message, data, {
    pagination: {
      total: pagination.total,
      limit: pagination.limit,
      skip: pagination.skip,
      hasMore: pagination.skip + pagination.limit < pagination.total,
    },
  });
};

const formatErrorResponse = (message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return response;
};

const formatValidationError = (message, validationErrors) => {
  return formatErrorResponse(message, 400, validationErrors);
};

const formatNotFoundError = (resource) => {
  return formatErrorResponse(`${resource} not found`, 404);
};

const formatUnauthorizedError = (message = 'Unauthorized') => {
  return formatErrorResponse(message, 401);
};

const formatForbiddenError = (message = 'Forbidden') => {
  return formatErrorResponse(message, 403);
};

const formatConflictError = (message = 'Conflict') => {
  return formatErrorResponse(message, 409);
};

const formatInternalError = (message = 'Internal Server Error') => {
  return formatErrorResponse(message, 500);
};

/**
 * Format subscription response with calculated fields
 */
const formatSubscriptionResponse = (subscription) => {
  if (!subscription) return null;

  return {
    _id: subscription._id,
    user: subscription.user,
    plan: subscription.plan,
    priceAtPurchase: subscription.priceAtPurchase,
    startDate: subscription.startDate,
    expiryDate: subscription.expiryDate,
    status: subscription.status,
    autoRenew: subscription.autoRenew,
    isExpired: subscription.isExpired && subscription.isExpired(),
    isActive: subscription.isActive && subscription.isActive(),
    daysRemaining: subscription.getDaysRemaining ? subscription.getDaysRemaining() : 0,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
};

/**
 * Format user response (exclude password)
 */
const formatUserResponse = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Format plan response
 */
const formatPlanResponse = (plan) => {
  if (!plan) return null;

  return {
    _id: plan._id,
    planName: plan.planName,
    price: plan.price,
    durationInDays: plan.durationInDays,
    features: plan.features || [],
    activeStatus: plan.activeStatus,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

module.exports = {
  formatSuccessResponse,
  formatPaginatedResponse,
  formatErrorResponse,
  formatValidationError,
  formatNotFoundError,
  formatUnauthorizedError,
  formatForbiddenError,
  formatConflictError,
  formatInternalError,
  formatSubscriptionResponse,
  formatUserResponse,
  formatPlanResponse,
};

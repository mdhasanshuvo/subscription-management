const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const AuditLog = require('../models/AuditLog');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');

/**
 * Get dashboard analytics for admin
 * GET /api/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Total users count
    const totalUsers = await User.countDocuments();

    // Total active users (users with active subscriptions)
    const usersWithActiveSubscriptions = await Subscription.distinct('user', {
      status: 'active',
    });
    const activeUsers = usersWithActiveSubscriptions.length;

    // Total subscriptions
    const totalSubscriptions = await Subscription.countDocuments();

    // Active subscriptions count
    const allSubscriptions = await Subscription.find();
    const totalActiveSubscriptions = allSubscriptions.filter((s) => s.isActive()).length;

    // Total revenue (sum of priceAtPurchase for active subscriptions)
    const totalRevenueResult = await Subscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$priceAtPurchase' },
        },
      },
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Monthly recurring revenue (MRR)
    // For simplicity, we assume all active subscriptions are monthly
    const mrrResult = await Subscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: null,
          mrr: { $sum: '$priceAtPurchase' },
        },
      },
    ]);

    const mrr = mrrResult[0]?.mrr || 0;

    // Expired subscriptions count
    const expiredCount = await Subscription.countDocuments({
      status: 'expired',
    });

    // Cancelled subscriptions count
    const cancelledCount = await Subscription.countDocuments({
      status: 'cancelled',
    });

    res.status(200).json(
      formatSuccessResponse('Dashboard analytics retrieved successfully', {
        totalUsers,
        activeUsers,
        totalSubscriptions,
        totalActiveSubscriptions,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        mrr: parseFloat(mrr.toFixed(2)),
        expiredCount,
        cancelledCount,
        churnRate: totalUsers > 0 ? ((cancelledCount / totalUsers) * 100).toFixed(2) : 0,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscriptions breakdown by plan
 * GET /api/analytics/subscriptions-by-plan
 */
const getSubscriptionsByPlan = async (req, res, next) => {
  try {
    const subscriptionsByPlan = await Subscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: { $sum: '$priceAtPurchase' },
        },
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: '_id',
          as: 'planDetails',
        },
      },
      {
        $unwind: '$planDetails',
      },
      {
        $project: {
          _id: 1,
          planName: '$planDetails.planName',
          count: 1,
          revenue: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json(
      formatSuccessResponse('Subscriptions by plan retrieved successfully', subscriptionsByPlan)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analysis
 * GET /api/analytics/revenue
 */
const getRevenueAnalysis = async (req, res, next) => {
  try {
    // Revenue by status
    const revenueByStatus = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$priceAtPurchase' },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    // Average subscription value
    const avgSubscriptionValue = await Subscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$priceAtPurchase' },
        },
      },
    ]);

    const avgValue = avgSubscriptionValue[0]?.avgValue || 0;

    res.status(200).json(
      formatSuccessResponse('Revenue analysis retrieved successfully', {
        revenueByStatus,
        averageSubscriptionValue: parseFloat(avgValue.toFixed(2)),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user growth analytics
 * GET /api/analytics/user-growth
 */
const getUserGrowth = async (req, res, next) => {
  try {
    // Users created this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: firstDayOfMonth,
      },
    });

    // Total users
    const totalUsers = await User.countDocuments();

    // Users with active subscriptions
    const usersWithActiveSubscriptions = await Subscription.distinct('user', {
      status: 'active',
    });

    res.status(200).json(
      formatSuccessResponse('User growth analysis retrieved successfully', {
        totalUsers,
        newUsersThisMonth,
        usersWithActiveSubscriptions: usersWithActiveSubscriptions.length,
        conversionRate:
          totalUsers > 0
            ? ((usersWithActiveSubscriptions.length / totalUsers) * 100).toFixed(2)
            : 0,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 * GET /api/analytics/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50, skip = 0 } = req.query;

    let filter = {};
    if (action) {
      filter.action = action;
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .populate('subscription')
      .populate('plan', 'planName price')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json(
      formatSuccessResponse('Audit logs retrieved successfully', {
        logs,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getSubscriptionsByPlan,
  getRevenueAnalysis,
  getUserGrowth,
  getAuditLogs,
};

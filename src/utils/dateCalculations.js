/**
 * Utility functions for date and pricing calculations
 */

/**
 * Calculate subscription expiry date
 * @param {number} durationInDays - Duration of subscription
 * @param {Date} startDate - Start date (default: now)
 * @returns {Date} Expiry date
 */
const calculateExpiryDate = (durationInDays, startDate = new Date()) => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + durationInDays);
  return expiryDate;
};

/**
 * Calculate days remaining in subscription
 * @param {Date} expiryDate - Subscription expiry date
 * @returns {number} Days remaining (0 if expired)
 */
const getDaysRemaining = (expiryDate) => {
  const now = new Date();
  if (now > expiryDate) {
    return 0;
  }
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((expiryDate - now) / msInDay);
};

/**
 * Calculate percentage of subscription used
 * @param {Date} startDate - Subscription start date
 * @param {Date} expiryDate - Subscription expiry date
 * @returns {number} Percentage used (0-100)
 */
const getPercentageUsed = (startDate, expiryDate) => {
  const now = new Date();

  // If not started yet
  if (now < startDate) {
    return 0;
  }

  // If already expired
  if (now > expiryDate) {
    return 100;
  }

  const totalMs = expiryDate - startDate;
  const usedMs = now - startDate;

  return Math.round((usedMs / totalMs) * 100);
};

/**
 * Check if date is within subscription period
 * @param {Date} startDate - Subscription start date
 * @param {Date} expiryDate - Subscription expiry date
 * @returns {boolean} True if current date is within period
 */
const isWithinSubscriptionPeriod = (startDate, expiryDate) => {
  const now = new Date();
  return now >= startDate && now <= expiryDate;
};

/**
 * Calculate pro-rata amount (usage-based)
 * @param {number} totalPrice - Total subscription price
 * @param {Date} startDate - Subscription start date
 * @param {Date} expiryDate - Subscription expiry date
 * @param {Date} refundDate - Date to calculate refund to
 * @returns {number} Pro-rata amount
 */
const calculateProRataAmount = (totalPrice, startDate, expiryDate, refundDate = new Date()) => {
  // If refund date is outside period, return 0
  if (refundDate < startDate || refundDate > expiryDate) {
    return 0;
  }

  const totalMs = expiryDate - startDate;
  const remainingMs = expiryDate - refundDate;

  const proRataAmount = (totalPrice * remainingMs) / totalMs;

  return parseFloat(proRataAmount.toFixed(2));
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date as ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO string
 */
const formatDateISO = (date) => {
  return new Date(date).toISOString();
};

module.exports = {
  calculateExpiryDate,
  getDaysRemaining,
  getPercentageUsed,
  isWithinSubscriptionPeriod,
  calculateProRataAmount,
  formatDate,
  formatDateISO,
};

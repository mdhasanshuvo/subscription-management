const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: [true, 'Please provide a plan name'],
      unique: true,
      trim: true,
      minlength: [2, 'Plan name must be at least 2 characters'],
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    durationInDays: {
      type: Number,
      required: [true, 'Please provide duration in days'],
      min: [1, 'Duration must be at least 1 day'],
      max: [365, 'Duration cannot exceed 365 days'],
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    activeStatus: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster plan lookups
planSchema.index({ planName: 1 });
planSchema.index({ activeStatus: 1 });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', planSchema);

module.exports = SubscriptionPlan;

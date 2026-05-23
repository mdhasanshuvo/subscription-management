#!/usr/bin/env node

/**
 * Database Seeding Script
 * This script populates the database with initial plans and an admin user
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');
const { connectDB, disconnectDB } = require('../src/config/database');

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await connectDB();

    // Clear existing data (optional - for development only)
    console.log('📦 Clearing existing data...');
    await User.deleteMany({});
    await SubscriptionPlan.deleteMany({});

    // Create subscription plans
    console.log('📋 Creating subscription plans...');
    const plans = await SubscriptionPlan.insertMany([
      {
        planName: 'Starter',
        price: 9.99,
        durationInDays: 30,
        features: ['Up to 10 projects', 'Basic support', '5GB storage'],
        activeStatus: true,
      },
      {
        planName: 'Professional',
        price: 29.99,
        durationInDays: 30,
        features: [
          'Unlimited projects',
          'Priority support',
          '100GB storage',
          'Advanced analytics',
        ],
        activeStatus: true,
      },
      {
        planName: 'Enterprise',
        price: 99.99,
        durationInDays: 30,
        features: [
          'Unlimited everything',
          '24/7 dedicated support',
          'Unlimited storage',
          'Advanced analytics',
          'Custom integrations',
          'SLA guarantee',
        ],
        activeStatus: true,
      },
      {
        planName: 'Free Trial',
        price: 0,
        durationInDays: 14,
        features: ['All Professional features', 'Limited to 14 days', 'Analytics excluded'],
        activeStatus: true,
      },
    ]);
    console.log(`✓ Created ${plans.length} subscription plans`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin',
      isActive: true,
    });
    await adminUser.save();
    console.log('✓ Admin user created');
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: admin123456`);

    // Create test user
    console.log('👤 Creating test user...');
    const testUser = new User({
      name: 'Test User',
      email: 'user@example.com',
      password: 'user123456',
      role: 'user',
      isActive: true,
    });
    await testUser.save();
    console.log('✓ Test user created');
    console.log(`  Email: user@example.com`);
    console.log(`  Password: user123456`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login with admin credentials');
    console.log('3. Test the API using Postman collection\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

seedDatabase();

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${mongoose.connection.db.name}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected successfully');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};

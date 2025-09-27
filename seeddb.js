const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intrst')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const seedDemoUser = async () => {
  try {
    const existing = await User.findOne({ email: 'demo@intrst.com' });
    if (existing) {
      console.log('Demo user already exists');
      return;
    }

    const demoUser = new User({
      email: 'demo@intrst.com',
      password: 'demo123', // will be hashed automatically
      firstName: 'Demo',
      lastName: 'User'
    });

    await demoUser.save();
    console.log('✅ Demo user created: demo@intrst.com / Password123');
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

seedDemoUser();

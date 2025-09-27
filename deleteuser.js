import mongoose from 'mongoose';
import User from './models/User.js'; // adjust path if needed
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intrst';

const deleteDemoUser = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const result = await User.deleteOne({ email: 'demo@intrst.com' });
    console.log('Delete result:', result);

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Error deleting demo user:', err);
  }
};

deleteDemoUser();

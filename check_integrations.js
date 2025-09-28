const mongoose = require('mongoose');
const User = require('./models/User');
const { ObjectId } = require('mongodb');

async function checkUserIntegrations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/intrst');
    console.log('✅ Connected to MongoDB');
    
    // Check using the user ID from server logs
    const userId = '68d791bf448a94b906714085';
    const user = await User.findById(userId).lean();
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      
      // List all users
      const users = await User.find({}, 'email firstName lastName').lean();
      console.log(`📋 Found ${users.length} users in database:`);
      users.forEach(u => console.log('-', u.email, u.firstName, u.lastName, u._id));
      return;
    }
    
    console.log('📊 User found:', user.email, user.firstName, user.lastName);
    console.log('📊 User integrations data:');
    console.log('- Has integrations:', !!user.integrations);
    console.log('- Connected accounts:', user.integrations?.connected?.length || 0);
    console.log('- Has spending data:', user.integrations?.data?.spending?.length || 0);
    console.log('- Has investment data:', user.integrations?.data?.investment?.length || 0);
    console.log('- Has retirement data:', user.integrations?.data?.retirement?.length || 0);
    console.log('- Has insights:', !!user.integrations?.insights);
    
    if (user.integrations?.data?.investment && user.integrations.data.investment.length > 0) {
      console.log('\n� Sample investment transactions:');
      console.log(JSON.stringify(user.integrations.data.investment.slice(0, 2), null, 2));
    }
    
    if (user.integrations?.insights) {
      console.log('\n💡 Insights summary:');
      console.log(JSON.stringify(user.integrations.insights, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkUserIntegrations();
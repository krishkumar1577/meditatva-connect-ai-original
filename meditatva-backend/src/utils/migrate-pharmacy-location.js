const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Fix pharmacy location schema for existing users
const fixPharmacyLocationSchema = async () => {
  try {
    console.log('🔧 Starting pharmacy location schema migration...');
    
    // Find users with malformed pharmacy location data
    const usersWithMalformedLocation = await mongoose.connection.db.collection('users').find({
      'pharmacyDetails.location.type': 'Point',
      $or: [
        { 'pharmacyDetails.location.coordinates': { $exists: false } },
        { 'pharmacyDetails.location.coordinates': [] },
        { 'pharmacyDetails.location.coordinates': null }
      ]
    }).toArray();

    console.log(`Found ${usersWithMalformedLocation.length} users with malformed pharmacy location data`);

    if (usersWithMalformedLocation.length > 0) {
      for (const user of usersWithMalformedLocation) {
        const updateData = {};
        
        // For non-pharmacy users, remove the location.type and coordinates entirely
        if (!user.pharmacyDetails?.isPharmacy) {
          updateData['$unset'] = {
            'pharmacyDetails.location.type': '',
            'pharmacyDetails.location.coordinates': ''
          };
          
          console.log(`🧹 Cleaning location data for non-pharmacy user: ${user.email}`);
        } else {
          // For pharmacy users, set default coordinates if missing
          updateData['$set'] = {
            'pharmacyDetails.location.coordinates': [0, 0] // Default coordinates, should be updated by pharmacy
          };
          
          console.log(`🏥 Setting default coordinates for pharmacy user: ${user.email}`);
        }

        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          updateData
        );
      }

      console.log('✅ Migration completed successfully');
    } else {
      console.log('✅ No users need migration');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await fixPharmacyLocationSchema();
    console.log('🎉 All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { fixPharmacyLocationSchema };
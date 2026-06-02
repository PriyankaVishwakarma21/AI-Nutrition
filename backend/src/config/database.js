import mongoose from 'mongoose';

const MAX_RETRIES = 5;

export const connectDB = async () => {
  let retries = MAX_RETRIES;
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${err.message} (${retries} retries left)`);
      if (retries === 0) {
        console.error('Max retries reached – exiting.');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

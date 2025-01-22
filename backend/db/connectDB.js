import mongoose from 'mongoose';

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MONGODB Connected successfully.");
    })
    .catch((err) => {
      console.log("MONGODB failed to connect:", err.message);
    })
}

export default connectDB;
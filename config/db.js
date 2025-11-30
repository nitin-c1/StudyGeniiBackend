import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const connectDB = async () => {
  try {
     const conn = await mongoose.connect(process.env.MONGO_DB);
    console.log(`✅ Study Genii Database connected: ${conn.connection.host}`);
    }

    catch(error){
        console.error("Error",error);
    }
    
}
export default connectDB;

import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  const usersByPhone = await User.find({ contact_number: '7999967578' });
  console.log('Users with phone 7999967578:', usersByPhone.map(u => u.email));
  
  const userByEmail = await User.findOne({ email: 'anshul.sharma6163@gmail.com' });
  console.log('User with email anshul.sharma6163@gmail.com:', userByEmail ? 'Found' : 'Not Found');
  if (userByEmail) {
    console.log('User by email phone:', userByEmail.contact_number);
  }
  
  await mongoose.disconnect();
}

check();

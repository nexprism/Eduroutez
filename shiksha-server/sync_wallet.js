import mongoose from 'mongoose';
import User from './src/models/User.js';
import Student from './src/models/Student.js';
import Referral from './src/models/Referral.js';
import StudentWebinarBooking from './src/models/StudentWebinarBooking.js';
import WalletTransaction from './src/models/WalletTransaction.js';

async function syncWallet() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to MongoDB");

        // Find all bookings with a referral code
        const bookings = await StudentWebinarBooking.find({ referralCodeUsed: { $exists: true, $ne: null } });
        
        for (const booking of bookings) {
            // Find the user who owns this referral code
            const referrerUser = await User.findOne({ referalCode: { $regex: new RegExp("^" + booking.referralCodeUsed + "$", "i") } });
            if (!referrerUser) continue;
            
            const referrerStudent = await Student.findOne({ user: referrerUser._id });
            if (!referrerStudent) continue;

            // Check if a referral record exists and is EARNED
            const existingReferral = await Referral.findOne({ 
                referrer: referrerStudent._id,
                referred: booking.student,
                webinar: booking.webinar
            });

            if (!existingReferral || existingReferral.status !== 'EARNED') {
                console.log(`Found missing reward for referrer ${referrerUser.name} from booking ${booking._id}`);
                
                if (existingReferral) {
                    existingReferral.status = 'EARNED';
                    await existingReferral.save();
                } else {
                    await Referral.create({
                        referrer: referrerStudent._id,
                        referred: booking.student,
                        webinar: booking.webinar,
                        status: 'EARNED'
                    });
                }

                // Credit Wallet
                referrerStudent.walletBalance = (referrerStudent.walletBalance || 0) + 1;
                await referrerStudent.save();

                await WalletTransaction.create({
                    user: referrerUser._id,
                    type: "CREDIT",
                    amount: 1,
                    remarks: `Referral bonus: missing reward synced for past booking`,
                    status: "COMPLETED"
                });
                
                console.log("Credited 1 rs to wallet!");
            }
        }
        
        console.log("Sync complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

syncWallet();

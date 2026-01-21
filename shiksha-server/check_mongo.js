import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/eduroutez');
        const admin = mongoose.connection.db.admin();
        const info = await admin.serverStatus();
        console.log('MongoDB Version:', info.version);

        const buildInfo = await admin.buildInfo();
        console.log('Build Info Version:', buildInfo.version);

        // Check if it's Atlas
        console.log('Is Atlas:', info.host.includes('mongodb.net'));

        // Check if allowDiskUse is supported on a simple aggregate
        try {
            await mongoose.connection.db.collection('institutes').aggregate([{ $sort: { createdAt: -1 } }], { allowDiskUse: true }).next();
            console.log('allowDiskUse: true works on raw aggregate');
        } catch (e) {
            console.log('allowDiskUse: true FAILED on raw aggregate:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

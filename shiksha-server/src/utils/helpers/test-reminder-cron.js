import cron from 'node-cron';
import User from '../../models/User.js';
import Counselor from '../../models/Counselor.js';
import { sendEmail } from '../Email/email.js';

export const runReminderCheck = async () => {
    try {
        const now = new Date();

        console.log('\n--- Running Test Reminder Check ---', now.toISOString());

        // ==============================
        // 🔍 DEBUG: CHECK ALL USERS
        // ==============================
        const allUsers = await User.find({});
        console.log(`Total users in DB: ${allUsers.length}`);

        allUsers.forEach(u => {
            console.log({
                email: u.email,
                role: u.role,
                date: u.scheduledTestDate,
                r48: u.scheduledTestReminder48HourSent,
                r24: u.scheduledTestReminder1DaySent,
                r1h: u.scheduledTestReminder1HourSent
            });
        });

        // ==============================
        // ✅ 48 HOUR REMINDER
        // ==============================
        const fortyEightHoursAhead = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const usersFor48Hour = await User.find({
            scheduledTestDate: { $lte: fortyEightHoursAhead },
            role: 'counsellor',
            $or: [
                { scheduledTestReminder48HourSent: false },
                { scheduledTestReminder48HourSent: { $exists: false } }
            ]
        });

        console.log(`Found ${usersFor48Hour.length} users for 48-hour reminder`);

        for (const user of usersFor48Hour) {
            try {
                await sendEmail(
                    user.email,
                    'Test Reminder: 48 Hours to Go',
                    `<p>Hi ${user.name}, your test is scheduled at <b>${user.scheduledTestDate}</b></p>`
                );

                user.scheduledTestReminder48HourSent = true;
                await user.save();

                await Counselor.findByIdAndUpdate(user._id, {
                    scheduledTestReminder48HourSent: true
                });

                console.log(`✅ 48h mail sent → ${user.email}`);
            } catch (err) {
                console.error(`❌ 48h fail → ${user.email}`, err.message);
            }
        }

        // ==============================
        // ✅ 24 HOUR REMINDER
        // ==============================
        const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const usersFor24Hour = await User.find({
            scheduledTestDate: { $lte: oneDayAhead },
            role: 'counsellor',
            $or: [
                { scheduledTestReminder1DaySent: false },
                { scheduledTestReminder1DaySent: { $exists: false } }
            ]
        });

        console.log(`Found ${usersFor24Hour.length} users for 24-hour reminder`);

        for (const user of usersFor24Hour) {
            try {
                await sendEmail(
                    user.email,
                    'Test Reminder: 24 Hours to Go',
                    `<p>Hi ${user.name}, your test is in 24 hours at <b>${user.scheduledTestDate}</b></p>`
                );

                user.scheduledTestReminder1DaySent = true;
                await user.save();

                await Counselor.findByIdAndUpdate(user._id, {
                    scheduledTestReminder1DaySent: true
                });

                console.log(`✅ 24h mail sent → ${user.email}`);
            } catch (err) {
                console.error(`❌ 24h fail → ${user.email}`, err.message);
            }
        }

        // ==============================
        // ✅ 1 HOUR REMINDER
        // ==============================
        const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000);

        const usersFor1Hour = await User.find({
            scheduledTestDate: { $lte: oneHourAhead },
            role: 'counsellor',
            $or: [
                { scheduledTestReminder1HourSent: false },
                { scheduledTestReminder1HourSent: { $exists: false } }
            ]
        });

        console.log(`Found ${usersFor1Hour.length} users for 1-hour reminder`);

        for (const user of usersFor1Hour) {
            try {
                await sendEmail(
                    user.email,
                    'Final Reminder: 1 Hour Left',
                    `<p>Hi ${user.name}, your test starts in 1 hour at <b>${user.scheduledTestDate}</b></p>`
                );

                user.scheduledTestReminder1HourSent = true;
                await user.save();

                await Counselor.findByIdAndUpdate(user._id, {
                    scheduledTestReminder1HourSent: true
                });

                console.log(`✅ 1h mail sent → ${user.email}`);
            } catch (err) {
                console.error(`❌ 1h fail → ${user.email}`, err.message);
            }
        }

        console.log('--- Test Reminder Check Complete ---\n');

    } catch (error) {
        console.error('🔥 Cron Error:', error?.message || error);
    }
};

// ==============================
// ✅ CRON (EVERY 5 MINUTES)
// ==============================
export const initTestReminderCron = () => {
    cron.schedule('*/5 * * * *', runReminderCheck);
};
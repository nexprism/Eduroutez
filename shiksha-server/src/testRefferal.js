import mongoose from 'mongoose';
import UserService from './services/users-service.js';

mongoose.connect('mongodb+srv://nexprism:eduroutez@nexprism.jzmky.mongodb.net/eduroutez?retryWrites=true&w=majority&appName=nexprism')
.then(async () => {
    const userService = new UserService();
    // Test for '67b02ad56c1d05f08fa26d53'
    const history = await userService.getMyRefferal('67b02ad56c1d05f08fa26d53');
    console.log("History for 67b02ad56c1d05f08fa26d53:");
    console.log(history);
    process.exit();
}).catch(e => {
    console.error(e);
    process.exit(1);
});

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');

const check = async () => {
    console.log('Script started...');
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in .env');
        process.exit(1);
    }
    console.log('Using MONGO_URI:', process.env.MONGO_URI);

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB!');
        
        const userCount = await User.countDocuments({});
        console.log('User Count:', userCount);
        
        const vehicleCount = await Vehicle.countDocuments({});
        console.log('Vehicle Count:', vehicleCount);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

check();

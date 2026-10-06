const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database is connected successfully')
    } catch (error) {
        console.log("Database connection failed")
        process.exit(1);
    }
}

module.exports = connectDB;
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb+srv://storagedrive344:Himu%40backend@cluster0.jszpd.mongodb.net/jayant"; // Use the environment variable
        if (!uri) {
            throw new Error("MONGO_URI is not defined in the environment variables.");
        }
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;


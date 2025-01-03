const mongoose = require("mongoose");
const dotenv = require('dotenv');


dotenv.config();

const connectDB = async () => {
    try {
     
        const DB_URI = process.env.MONGO_URI
        if (!DB_URI) {
            throw new Error("Database URI is not defined in environment variables.");
        }
        
        const connection = await mongoose.connect(DB_URI);

        console.log("Database connected" );
    } catch (error) {
       
        console.error(`Database connection error: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = connectDB;

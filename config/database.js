import mongoose from "mongoose";

export const connectDatabase = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGOURI);
        console.log(`MongoDB connected: ${connection.host}`);
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
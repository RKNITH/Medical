import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // OPTIMIZATION: connection pool tuned for 500 concurrent users.
        // Default poolSize is 5 — completely inadequate for concurrent load.
        // Each active HTTP request that hits MongoDB needs a connection from
        // the pool; 500 users = up to 500 simultaneous queries.
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 50,          // allow up to 50 parallel DB connections
            minPoolSize: 5,           // keep 5 warm connections ready
            serverSelectionTimeoutMS: 5000,   // fail fast if MongoDB is unreachable
            socketTimeoutMS: 45000,           // drop idle connections after 45s
            connectTimeoutMS: 10000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Graceful shutdown — release pool on SIGTERM (e.g. Render/Heroku restart)
        process.on("SIGTERM", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed on SIGTERM");
            process.exit(0);
        });

    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error; // let server.js catch this and exit
    }
};

export default connectDB;

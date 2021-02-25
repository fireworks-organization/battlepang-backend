import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const m_connect = () => {
    mongoose.connect(
        process.env.MONGO_PROD_URL,
        {
            autoIndex: false,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
            poolSize: 5,
            bufferMaxEntries: 0,
            useNewUrlParser: true
        }
    );
}

m_connect();
const db = mongoose.connection;

const handleOpen = () => console.log("✅  Connected to DB");
const handleError = (error) => {
    console.log(`❌ Error on DB Connection:${error}`);
    return process.exit(1)
}

db.once("open", handleOpen);
db.on("error", handleError); 
db.on('disconnect', m_connect) 
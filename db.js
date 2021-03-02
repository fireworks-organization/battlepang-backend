import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
console.log("Connecting to database " + process.env.MONGO_PROD_URL)
const m_connect = () => {
    mongoose.connect(
        process.env.MONGO_PROD_URL,
        {
            autoIndex: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            bufferMaxEntries: 0,
            poolSize : 5,
            socketTimeoutMS : 3000,
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
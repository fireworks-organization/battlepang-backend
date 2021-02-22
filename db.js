import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const m_connect = () => {
    mongoose.connect(
        process.env.MONGO_PROD_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }
    );
}

m_connect();
const db = mongoose.connection;

const handleOpen = () => console.log("✅  Connected to DB");
const handleError = error => console.log(`❌ Error on DB Connection:${error}`);

db.once("open", handleOpen);
db.on("error", handleError); 
db.on('disconnect', m_connect) 
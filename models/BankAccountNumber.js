import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const BankAccountNumberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bankAccountNumber: {
    type: String,
    default: ""
  },
  bankName: {
    type: String,
    default: ""
  }
});

const model = mongoose.model("BankAccountNumber", BankAccountNumberSchema);

export default model;

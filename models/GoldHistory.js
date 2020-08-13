import mongoose from "mongoose";

const GoldHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  payment: { // 결제 이력 Id
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentHistory"
  },
  exchangeHistory: { // 환급신청 Id
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExchangeHistory"
  },
  chargeGold: { // 충전 골드
    type: String,
    default: ""
  },
  beforeGold: { // 충전전 유저골드
    type: String,
    default: ""
  },
  afterGold: { // 충전후 유저골드
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const model = mongoose.model("GoldHistory", GoldHistorySchema);

export default model;

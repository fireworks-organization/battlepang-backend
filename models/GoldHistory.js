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
  exchangeHistory: { // 환전신청 Id
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExchangeHistory"
  },
  status: {
    // 페이먼트가 없을경우 수동 상태값 
    // create-battle 
    // join-battle 
    // 페이먼트의경우 /open paymant popup/ cancel / paid / error 등이있음.
    type: String,
    default: ""
  },
  battle: { //  배틀 Id
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle"
  },
  subBattle: { //  배틀 Id
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubBattle"
  },
  message: {
    // 페이먼트가 없을경우 수동 메세지값 
    type: String,
    default: ""
  },
  chargeGold: { // 충전 골드
    type: Number,
    default: ""
  },
  beforeGold: { // 충전전 유저골드
    type: Number,
    default: ""
  },
  afterGold: { // 충전후 유저골드
    type: Number,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const model = mongoose.model("GoldHistory", GoldHistorySchema);

export default model;

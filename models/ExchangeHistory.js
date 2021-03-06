import mongoose from "mongoose";

const ExchangeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  bankAccountNumber: { // 환전 계좌
    type: String,
    default: ""
  },
  bankName: { // 은행명
    type: String,
    default: ""
  },
  status: { // 상태값 status
    type: String,
    default: ""
  },
  goldHistory: { // 충전 골드 금액 및 유저를 갖고있는 연동데이터
    type: mongoose.Schema.Types.ObjectId,
    ref: "GoldHistory"
  },
  exchangeGold: { // 수수료 제외 환전금액
    type: String,
    default: ""
  },
  exchangeMoney: { // 수수료 제외 환전금액
    type: String,
    default: ""
  },
  message: { // 결과 메세지
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  exchangedAt: {
    type: Date,
    default: ""
  },
});

const model = mongoose.model("ExchangeHistory", ExchangeHistorySchema);

export default model;

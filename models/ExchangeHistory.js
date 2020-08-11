import mongoose from "mongoose";

const ExchangeHistorySchema = new mongoose.Schema({
  BankAccountNumber: { // 아임포트 고유 아이디 imp_uid
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccountNumber"
  },
  status: { // 상태값 status
    type: String,
    default: ""
  },
  goldHistory: { // 충전 골드 금액 및 유저를 갖고있는 연동데이터
    type: mongoose.Schema.Types.ObjectId,
    ref: "GoldHistory"
  },
  message: { // 결과 메세지
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const model = mongoose.model("ExchangeHistory", ExchangeHistorySchema);

export default model;

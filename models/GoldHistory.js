import mongoose from "mongoose";

const GoldHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  impUid: { // 아임포트 고유 아이디 imp_uid
    type: String,
    default: ""
  },
  merchantUid: { // 주문번호 merchant_uid
    type: String,
    default: ""
  },
  requestId: { // 요청 ID
    type: String,
    default: ""
  },
  applyNum: { // 카드사 승인번호 apply_num
    type: String,
    default: ""
  },
  paidAmount: { // 결제 금액 paid_amount
    type: String,
    default: ""
  },
  currency: { // 통화 currency
    type: String,
    default: ""
  },
  payMethod: { // 결제 방법 pay_method
    type: String,
    default: ""
  },
  status: { // 상태값 status
    type: String,
    default: ""
  },
  paidAt: { // 결제 시각 paid_at
    type: String,
    default: ""
  },
  chargeGold: { // 충전 골드
    type: String,
    default: ""
  },
  message: { // 결과 메세지
    type: String,
    default: ""
  },
});

const model = mongoose.model("GoldHistory", GoldHistorySchema);

export default model;

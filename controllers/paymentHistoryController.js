import passport from "passport";
import dotenv from "dotenv";
import GoldHistory from "../models/GoldHistory"
import PaymentHistory from "../models/PaymentHistory"
import User from "../models/User"
dotenv.config();

export const paymentHistory = async (req, res) => {
  const {
    query: { },
  } = req;
  try {
    const paymentHistories = await PaymentHistory.find().populate("user");
    console.log(paymentHistories)
    res.status(200).send({ paymentHistories });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const addPaymentHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const paymentHistoryObj = data.paymentHistoryObj;
  console.log(paymentHistoryObj)
  try {
    let paymentHistoryObjJSON = JSON.parse(paymentHistoryObj);
    const paymentHistory = new PaymentHistory(paymentHistoryObjJSON);
    await paymentHistory.save();
    res.status(200).send({ paymentHistory });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const updatePaymentHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const paymentHistoryObj = data.paymentHistoryObj;
  let paymentHistoryObjJSON = JSON.parse(paymentHistoryObj);
  try {
    const findPaymentHistoryObj = await PaymentHistory.findOne({
      _id: paymentHistoryObjJSON._id
    });
    const findUser = await User.findOne({
      _id: paymentHistoryObjJSON.user
    });
    if (!findUser) {
      const error = "충전할 유저를 찾을 수 없습니다.";
      if (paymentHistoryObjJSON.message) {
        findPaymentHistoryObj.status = paymentHistoryObjJSON.status + " / error";
        findPaymentHistoryObj.message = paymentHistoryObjJSON.message + " / " + error;
      }
      await findPaymentHistoryObj.save();
      res.status(400).send({ error });
      return false;
    }
    console.log(findUser.payment)
    const chargeGold = parseInt(paymentHistoryObjJSON.chargeGold);
    const goldHistoryObj = {
      user: findUser._id,
      paymentId: findPaymentHistoryObj._id,
      chargeGold,
      beforeGold: findUser.gold
    }
    const goldHistory = new GoldHistory(goldHistoryObj);
    const insertedGoldHistory = await goldHistory.save();
    findUser.gold = findUser.gold + chargeGold;
    await findUser.save();
    insertedGoldHistory.afterGold = findUser.gold;
    await insertedGoldHistory.save();
    if (!findPaymentHistoryObj) {
      if (paymentHistoryObjJSON.message) {
        findPaymentHistoryObj.message = paymentHistoryObjJSON.message;
      }
      const error = "업데이트할 기록이 없습니다.";
      if (paymentHistoryObjJSON.message) {
        findPaymentHistoryObj.status = paymentHistoryObjJSON.status + " / error";
        findPaymentHistoryObj.message = paymentHistoryObjJSON.message + " / " + error;
      }
      await findPaymentHistoryObj.save();
      res.status(400).send({ error });
      return false;
    }
    if (paymentHistoryObjJSON.impUid) {
      findPaymentHistoryObj.impUid = paymentHistoryObjJSON.impUid;
    }
    if (paymentHistoryObjJSON.merchantUid) {
      findPaymentHistoryObj.merchantUid = paymentHistoryObjJSON.merchantUid;
    }
    if (paymentHistoryObjJSON.applyNum) {
      findPaymentHistoryObj.applyNum = paymentHistoryObjJSON.applyNum;
    }
    if (paymentHistoryObjJSON.paidAmount) {
      findPaymentHistoryObj.paidAmount = paymentHistoryObjJSON.paidAmount;
    }
    if (paymentHistoryObjJSON.currency) {
      findPaymentHistoryObj.currency = paymentHistoryObjJSON.currency;
    }
    if (paymentHistoryObjJSON.payMethod) {
      findPaymentHistoryObj.payMethod = paymentHistoryObjJSON.payMethod;
    }
    if (paymentHistoryObjJSON.status) {
      findPaymentHistoryObj.status = paymentHistoryObjJSON.status;
    }
    if (paymentHistoryObjJSON.paidAt) {
      findPaymentHistoryObj.paidAt = paymentHistoryObjJSON.paidAt;
    }
    if (paymentHistoryObjJSON.chargeGold) {
      findPaymentHistoryObj.chargeGold = paymentHistoryObjJSON.chargeGold;
    }
    if (paymentHistoryObjJSON.requestId) {
      findPaymentHistoryObj.requestId = paymentHistoryObjJSON.requestId;
    }
    if (paymentHistoryObjJSON.message) {
      findPaymentHistoryObj.message = paymentHistoryObjJSON.message;
    }
    const paymentHistory = await findPaymentHistoryObj.save();
    res.status(200).send({ paymentHistory });
  } catch (error) {
    console.log(error);
    const findPaymentHistoryObj = await PaymentHistory.findOne({
      _id: paymentHistoryObjJSON._id
    });
    if (findPaymentHistoryObj) {
      findPaymentHistoryObj.status = paymentHistoryObjJSON.status + " / other_error";
      findPaymentHistoryObj.message = paymentHistoryObjJSON.message + " / " + error;
      await findPaymentHistoryObj.save();
    }
    res.status(400).send({ error });
  }
};

import passport from "passport";
import dotenv from "dotenv";
import GoldHistory from "../models/GoldHistory"
import PaymentHistory from "../models/PaymentHistory"
import User from "../models/User"
dotenv.config();

export const paymentHistory = async (req, res) => {
  const {
    query: { paymentHistoryId }
  } = req;
  try {
    const populateList = ["user", "goldHistory"];
    let findOperate = {};
    if (paymentHistoryId) {
      findOperate = { _id: paymentHistoryId };
    }
    let paymentHistories = await PaymentHistory.find(findOperate).populate(populateList);
    res.status(200).send({ paymentHistories });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const addPaymentHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const paymentHistoryObj = data.paymentHistoryObj;
  try {
    let paymentHistoryObjJSON = JSON.parse(paymentHistoryObj);
    const paymentHistory = new PaymentHistory(paymentHistoryObjJSON);
    const insertedPaymentHistory = await paymentHistory.save();
    if (paymentHistoryObjJSON.payMethod == "무통장 입금") {
      const findUser = await User.findOne({
        _id: paymentHistoryObjJSON.user
      });
      if (!findUser) {
        const error = "충전할 유저를 찾을 수 없습니다.";
        if (paymentHistoryObjJSON.message) {
          paymentHistory.status = paymentHistoryObjJSON.status + " / error";
          paymentHistory.message = paymentHistoryObjJSON.message + " / " + error;
        }
        await paymentHistory.save();
        res.status(400).json({ error });
        return false;
      }
      const goldHistoryObj = {
        user: findUser._id,
        payment: paymentHistory._id,
        chargeGold: paymentHistoryObjJSON.chargeGold,
        beforeGold: findUser.gold,
        afterGold: findUser.gold
      }
      const goldHistory = new GoldHistory(goldHistoryObj);
      const insertedGoldHistory = await goldHistory.save();
      paymentHistory.goldHistory = insertedGoldHistory._id;
      await paymentHistory.save();
    }
    res.status(200).send({ paymentHistory: insertedPaymentHistory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const updatePaymentHistory = async (req, res) => {
  const {
    body: { paymentHistoryObj, userId },
    params: { paymentHistoryId },
  } = req;
  let paymentHistoryObjJSON = JSON.parse(paymentHistoryObj);

  try {
    const findPaymentHistoryObj = await PaymentHistory.findOne({
      _id: paymentHistoryId
    });

    const findUser = await User.findOne({
      _id: userId
    });
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
      res.status(400).json({ error });
      return false;
    }
    if (!findUser) {
      const error = "충전할 유저를 찾을 수 없습니다.";
      if (paymentHistoryObjJSON.message) {
        findPaymentHistoryObj.status = paymentHistoryObjJSON.status + " / error";
        findPaymentHistoryObj.message = paymentHistoryObjJSON.message + " / " + error;
      }
      await findPaymentHistoryObj.save();
      res.status(400).json({ error });
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
    const findGoldHistory = await GoldHistory.findOne({ _id: paymentHistoryObjJSON.goldHistory._id });
    if (!findGoldHistory) {
      const error = "환전처리를 진행할 골드 이력이 없습니다.";
      res.status(400).json({ error });
      return false;
    }
    if (findPaymentHistoryObj.status === "charge") {
      const chargeGold = parseInt(paymentHistoryObjJSON.goldHistory.chargeGold);
      findUser.gold = findUser.gold + chargeGold;
      await findUser.save();

      findGoldHistory.afterGold = findUser.gold;
      await findGoldHistory.save();
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
    res.status(400).json({ error });
  }
};

import passport from "passport";
import dotenv from "dotenv";
import GoldHistory from "../models/GoldHistory"
import ExchangeHistory from "../models/ExchangeHistory"
import User from "../models/User"
dotenv.config();

export const exchangeHistory = async (req, res) => {
  const {
    query: { },
  } = req;
  try {
    const exchangeHistories = await ExchangeHistory.find().populate("user");
    console.log(exchangeHistories)
    res.status(200).send({ exchangeHistories });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const addExchangeHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  console.log(data)
  const exchangeHistoryObjJSON = JSON.parse(data.exchangeHistoryObj);
  const userId = exchangeHistoryObjJSON.user;
  console.log(exchangeHistoryObjJSON)
  try {
    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
      const error = "환불할 유저를 찾을 수 없음.";
      console.log(error)
      res.status(400).json({ error });
      res.end();
      return false
    }
    const chargeGold = exchangeHistoryObjJSON.exchangeGold;
    const goldHistoryObj = {
      user: findUser._id,
      chargeGold,
      status: "wait-exchange",
      beforeGold: findUser.gold,
      message: `환전 신청으로 ${chargeGold}G 차감`
    }
    const goldHistory = new GoldHistory(goldHistoryObj);
    const insertedGoldHistory = await goldHistory.save();
    findUser.gold = findUser.gold + chargeGold;
    await findUser.save();
    insertedGoldHistory.afterGold = findUser.gold;
    await insertedGoldHistory.save();
    exchangeHistoryObjJSON.goldHistory = insertedGoldHistory._id;
    const exchangeHistory = new ExchangeHistory(exchangeHistoryObjJSON);
    await exchangeHistory.save();
    insertedGoldHistory.exchangeHistory = exchangeHistory._id;
    await insertedGoldHistory.save();
    res.status(200).send({ exchangeHistory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const updateExchangeHistory = async (req, res) => {
  const {
    body: { exchangeHistoryObj },
  } = req;
  console.log("updateExchangeHistory")
  console.log(updateExchangeHistory)
  let exchangeHistoryObjJSON = JSON.parse(exchangeHistoryObj);
  try {
    const findExchangeHistoryObj = await ExchangeHistory.findOne({
      _id: exchangeHistoryObjJSON._id
    });
    if (!findExchangeHistoryObj) {
      if (exchangeHistoryObjJSON.message) {
        findExchangeHistoryObj.message = exchangeHistoryObjJSON.message;
      }
      const error = "업데이트할 기록이 없습니다.";
      if (exchangeHistoryObjJSON.message) {
        findExchangeHistoryObj.status = exchangeHistoryObjJSON.status + " / error";
        findExchangeHistoryObj.message = exchangeHistoryObjJSON.message + " / " + error;
      }
      await findExchangeHistoryObj.save();
      res.status(400).json({ error });
      return false;
    }
    if (exchangeHistoryObjJSON.status) {
      findExchangeHistoryObj.status = exchangeHistoryObjJSON.status;
    }
    const findGoldHistory = await GoldHistory.findOne({ _id: exchangeHistoryObjJSON.goldHistory });
    if (!findGoldHistory) {
      const error = "환전처리를 진행할 골드 이력이 없습니다.";
      res.status(400).json({ error });
      return false;
    }
    if (exchangeHistoryObjJSON.status === "reject") {

      const findUser = await User.findOne({
        _id: exchangeHistoryObjJSON.user._id
      });
      if (!findUser) {
        const error = "유저를 찾을 수 없습니다.";
        console.log(error)
        res.status(400).json({ error });
        return false;
      }
      findGoldHistory.beforeGold = findUser.gold;
      const chargeGold = findGoldHistory.chargeGold * -1;
      findUser.gold = findUser.gold + chargeGold;
      await findUser.save();
      findGoldHistory.afterGold = findUser.gold;
      findGoldHistory.message = "환전처리가 반려되었습니다.";
      findGoldHistory.chargeGold = chargeGold;
      findGoldHistory.status = "reject-exchange";
    }
    if (exchangeHistoryObjJSON.status === "exchanged") {
      findGoldHistory.message = "환전처리가 완료되었습니다.";
      findGoldHistory.status = "exchanged";
    }
    await findGoldHistory.save();
    findExchangeHistoryObj.exchangedAt = Date.now();
    const exchangeHistory = await findExchangeHistoryObj.save();
    res.status(200).send({ exchangeHistory });
  } catch (error) {
    console.log(error);
    const findExchangeHistoryObj = await ExchangeHistory.findOne({
      _id: exchangeHistoryObjJSON._id
    });
    if (findExchangeHistoryObj) {
      findExchangeHistoryObj.status = exchangeHistoryObjJSON.status + " / other_error";
      findExchangeHistoryObj.message = exchangeHistoryObjJSON.message + " / " + error;
      await findExchangeHistoryObj.save();
    }
    res.status(400).json({ error });
  }
};

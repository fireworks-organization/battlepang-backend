import passport from "passport";
import dotenv from "dotenv";
import GoldHistory from "../models/GoldHistory"
import User from "../models/User"
dotenv.config();

export const goldHistory = async (req, res) => {
  const {
    query: { },
  } = req;
  try {
    res.status(200).send({ goldHistorys: [{ aaa: 'aaa' }, { bbb: 'bbb' }] });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const addGoldHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const goldHistoryObj = data.goldHistoryObj;
  console.log(goldHistoryObj)
  try {
    let goldHistoryObjJSON = JSON.parse(goldHistoryObj);
    const goldHistory = new GoldHistory(goldHistoryObjJSON);
    await goldHistory.save();
    res.status(200).send({ goldHistory });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const updateGoldHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const goldHistoryObj = data.goldHistoryObj;
  let goldHistoryObjJSON = JSON.parse(goldHistoryObj);
  try {
    const findGoldHistoryObj = await GoldHistory.findOne({
      _id: goldHistoryObjJSON._id
    });
    const findUser = await User.findOne({
      _id: goldHistoryObjJSON.user
    });
    if (!findUser) {
      const error = "충전할 유저가 없습니다.";
      if (goldHistoryObjJSON.massage) {
        findGoldHistoryObj.status = goldHistoryObjJSON.status + " / error";
        findGoldHistoryObj.massage = goldHistoryObjJSON.massage + " / " + error;
      }
      await findGoldHistoryObj.save();
      res.status(400).send({ error });
      return false;
    }
    console.log(findUser.gold)
    findUser.gold = findUser.gold + parseInt(goldHistoryObjJSON.chargeGold);
    await findUser.save();
    console.log(findUser.gold)
    if (!findGoldHistoryObj) {
      if (goldHistoryObjJSON.massage) {
        findGoldHistoryObj.massage = goldHistoryObjJSON.massage;
      }
      const error = "업데이트할 기록이 없습니다.";
      if (goldHistoryObjJSON.massage) {
        findGoldHistoryObj.status = goldHistoryObjJSON.status + " / error";
        findGoldHistoryObj.massage = goldHistoryObjJSON.massage + " / " + error;
      }
      await findGoldHistoryObj.save();
      res.status(400).send({ error });
      return false;
    }
    if (goldHistoryObjJSON.impUid) {
      findGoldHistoryObj.impUid = goldHistoryObjJSON.impUid;
    }
    if (goldHistoryObjJSON.merchantUid) {
      findGoldHistoryObj.merchantUid = goldHistoryObjJSON.merchantUid;
    }
    if (goldHistoryObjJSON.applyNum) {
      findGoldHistoryObj.applyNum = goldHistoryObjJSON.applyNum;
    }
    if (goldHistoryObjJSON.paidAmount) {
      findGoldHistoryObj.paidAmount = goldHistoryObjJSON.paidAmount;
    }
    if (goldHistoryObjJSON.currency) {
      findGoldHistoryObj.currency = goldHistoryObjJSON.currency;
    }
    if (goldHistoryObjJSON.payMethod) {
      findGoldHistoryObj.payMethod = goldHistoryObjJSON.payMethod;
    }
    if (goldHistoryObjJSON.status) {
      findGoldHistoryObj.status = goldHistoryObjJSON.status;
    }
    if (goldHistoryObjJSON.paidAt) {
      findGoldHistoryObj.paidAt = goldHistoryObjJSON.paidAt;
    }
    if (goldHistoryObjJSON.chargeGold) {
      findGoldHistoryObj.chargeGold = goldHistoryObjJSON.chargeGold;
    }
    if (goldHistoryObjJSON.requestId) {
      findGoldHistoryObj.requestId = goldHistoryObjJSON.requestId;
    }
    if (goldHistoryObjJSON.massage) {
      findGoldHistoryObj.massage = goldHistoryObjJSON.massage;
    }
    const goldHistory = await findGoldHistoryObj.save();
    res.status(200).send({ goldHistory });
  } catch (error) {
    console.log(error);
    const findGoldHistoryObj = await GoldHistory.findOne({
      _id: goldHistoryObjJSON._id
    });
    if (findGoldHistoryObj) {
      findGoldHistoryObj.status = goldHistoryObjJSON.status + " / other_error";
      findGoldHistoryObj.massage = goldHistoryObjJSON.massage + " / " + error;
      await findGoldHistoryObj.save();
    }
    res.status(400).send({ error });
  }
};

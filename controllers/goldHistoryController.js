import passport from "passport";
import dotenv from "dotenv";
import GoldHistory from "../models/GoldHistory"
import User from "../models/User"
dotenv.config();

const addOperate = (operate, key, value) => {
  console.log(operate)
  console.log((Object.keys(operate)))
  if (Object.keys(operate).length == 0) {
    operate[key] = value;
  } else {
    let array = [operate];
    let newObj = {};
    newObj[key] = value;
    array.push(newObj);
    operate = { $and: array };
  }
  return operate;
}


export const goldHistory = async (req, res) => {
  const {
    query: { goldHistoryId, user, count },
  } = req;
  try {
    console.log("goldHistory")
    console.log(goldHistoryId)
    console.log(user)
    console.log(count)
    const populateList = ["user", "payment"];
    let findOperate = {};

    let limit;
    if (goldHistoryId) {
      findOperate = addOperate(findOperate, "_id", goldHistoryId);
    }
    if (user) {
      findOperate = addOperate(findOperate, "user", user);
    }
    if (count) {
      limit = count;
    }
    const goldHistories = await GoldHistory.find(findOperate).populate(populateList).sort({ createdAt: -1 });
    // await Battle.deleteMany({});
    // await SubBattle.deleteMany({});
    // await GoldHistory.deleteMany({});
    res.status(200).send({ goldHistories });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const addGoldHistory = async (req, res) => {
  const {
    body: { data },
  } = req;
  const goldHistoryObj = data.goldHistoryObj;
  const userId = data.goldHistoryObj.user;
  console.log(goldHistoryObj)
  try {
    const findUser = User.find({ _id: userId });
    if (!findUser) {
      res.status(400).json({ error: "충전할 유저를 찾을 수 없음." });
      res.end();
    }
    let goldHistoryObjJSON = JSON.parse(goldHistoryObj);
    const goldHistory = new GoldHistory(goldHistoryObjJSON);
    await goldHistory.save();
    res.status(200).send({ goldHistory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
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
      const error = "충전할 유저를 찾을 수 없습니다.";
      if (goldHistoryObjJSON.message) {
        findGoldHistoryObj.status = goldHistoryObjJSON.status + " / error";
        findGoldHistoryObj.message = goldHistoryObjJSON.message + " / " + error;
      }
      await findGoldHistoryObj.save();
      res.status(400).json({ error });
      return false;
    }
    console.log(findUser.gold)
    findUser.gold = findUser.gold + parseInt(goldHistoryObjJSON.chargeGold);
    await findUser.save();
    console.log(findUser.gold)
    if (!findGoldHistoryObj) {
      if (goldHistoryObjJSON.message) {
        findGoldHistoryObj.message = goldHistoryObjJSON.message;
      }
      const error = "업데이트할 기록이 없습니다.";
      if (goldHistoryObjJSON.message) {
        findGoldHistoryObj.status = goldHistoryObjJSON.status + " / error";
        findGoldHistoryObj.message = goldHistoryObjJSON.message + " / " + error;
      }
      await findGoldHistoryObj.save();
      res.status(400).json({ error });
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
    if (goldHistoryObjJSON.message) {
      findGoldHistoryObj.message = goldHistoryObjJSON.message;
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
      findGoldHistoryObj.message = goldHistoryObjJSON.message + " / " + error;
      await findGoldHistoryObj.save();
    }
    res.status(400).json({ error });
  }
};

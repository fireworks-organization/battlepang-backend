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
    res.status(200).send({ goldHistories });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
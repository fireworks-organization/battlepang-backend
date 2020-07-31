import passport from "passport";
import dotenv from "dotenv";
import User from "../models/User";
import Rank from "../models/Rank";

dotenv.config();

export const ranks = async (req, res) => {
  const {
    query: { rankBy },
  } = req;
  try {
    if (!rankBy) {
      res.status(400).send({ error: "rankBy 파라미너를 확인해주세요. user, battle" });
    }
    const ranks = await User.aggregate([{ $sample: { size: 30 } }]);
    const oneDayAgoRanks = await Rank.find({ dateKeywordForSearch: "one-day-ago" }).sort({ rank: -1 });
    const oneWeekAgoRanks = await Rank.find({ dateKeywordForSearch: "one-week-ago" }).sort({ rank: -1 });
    const oneMonthAgoRanks = await Rank.find({ dateKeywordForSearch: "one-month-ago" }).sort({ rank: -1 });;
    res.status(200).send({ ranks, oneDayAgoRanks, oneWeekAgoRanks, oneMonthAgoRanks });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

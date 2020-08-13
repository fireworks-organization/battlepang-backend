import passport from "passport";
import dotenv from "dotenv";
import User from "../models/User";
import Rank from "../models/Rank";
import Battle from "../models/Battle";

dotenv.config();

export const ranks = async (req, res) => {
  const {
    query: { rankObject, rankDataForSearch, },
  } = req;
  try {
    if (!rankObject) {
      res.status(400).json({ error: "rankObject 파라미너를 확인해주세요. user, battle" });
    }
    if (rankObject === "users") {
      const ranks = await User.aggregate([{ $sample: { size: 30 } }]);
      const beforeDateRanks = await Rank.find({ dateKeywordForSearch: rankDataForSearch }).sort({ rank: -1 });
      res.status(200).send({ ranks, beforeDateRanks });
    } else if (rankObject === "battles") {
      if (rankDataForSearch == "gold") {
        const ranks = await Battle.find().sort({ gold: -1 }).populate("creator").limit(30);
        res.status(200).send({ ranks });
      }
      if (rankDataForSearch == "views") {
        const ranks = await Battle.find().sort({ views: -1 }).populate("creator").limit(30);
        res.status(200).send({ ranks });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

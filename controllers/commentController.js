import passport from "passport";
import dotenv from "dotenv";

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";

import Comment from "../models/Comment";

dotenv.config();

export const comments = async (req, res) => {
  const {
    query: { battleId, creator }
  } = req;
  console.log(creator);
  try {
    let findComments = [];
    if (battleId) {
      findComments = await Comment.find({ battleId })
        .populate("creator")
        .sort({ createdAt: -1 });
    } else if (creator) {
      findComments = await Comment.find({ creator })
        .populate("creator")
        .sort({ createdAt: -1 });
    } else {
      findComments = await Comment.find()
        .populate("creator")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ comments: findComments });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

export const addComment = async (req, res) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const battleId = data.battleId;
  const content = data.content;
  const creator = data.creator;
  const commentObj = { battleId, content, creator };

  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (findBattle) {
      const comment = new Comment(commentObj);
      await comment.save();
      findBattle.comments = [...findBattle.comments, comment];
      await findBattle.save();
      res.status(200).send({ comment });
    } else {
      const findSubBattle = await SubBattle.findOne({
        _id: battleId
      });

      if (findSubBattle) {
        const comment = new Comment(commentObj);
        await comment.save();
        findSubBattle.comments = [...findSubBattle.comments, comment];
        await findSubBattle.save();
        res.status(200).send({ comment });
      } else {
        res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

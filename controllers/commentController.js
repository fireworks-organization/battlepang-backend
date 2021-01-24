import passport from "passport";
import dotenv from "dotenv";

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";
import Report from "../models/Report";

import Comment from "../models/Comment";

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

export const comments = async (req, res) => {
  const {
    query: { battleId, creator, count }
  } = req;
  console.log(creator);
  try {

    console.log("battleId", battleId);
    console.log("creator", creator);
    console.log("count", count);
    const populateList = ["creator", "like", "battleId"];
    let findOperate = {};
    let limit;
    const sort = { createdAt: -1 }

    let findComments = [];

    if (battleId) {
      findOperate = addOperate(findOperate, "battleId", battleId);
    }
    if (creator) {
      findOperate = addOperate(findOperate, "creator", creator);
    }
    findComments = await Comment.find(findOperate).populate(populateList).limit(parseInt(limit)).sort(sort);
    res.status(200).json({ comments: findComments.filter(item => item.battleId) });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
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
        res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

export const reportComment = async (req, res) => {
  const {
    body: { data },
    params: { commentId }
  } = req;

  console.log(commentId)
  const reportObj = data.reportObj;
  console.log(reportObj)
  try {
    const findComment = await Comment.findOne({
      _id: commentId
    });
    if (findComment) {
      const report = new Report(reportObj);
      const addedReportObj = await report.save();
      res.status(200).send({ reportObj: addedReportObj });
    } else {
      res.status(400).json({ error: "신고 실패 에러가 발생하였습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};


export const likeComment = async (req, res) => {
  const {
    body: { data },
    params: { commentId }
  } = req;
  const userId = data.userId;
  const likeValue = data.likeValue; // true or false
  try {
    const findComment = await Comment.findOne({
      _id: commentId
    });
    if (findComment) {
      if (findComment.creator.toString() === userId.toString()) {
        res.status(400).json({ error: "자신의 댓글은 추천 불가능합니다." });
        return false;
      }
      if (likeValue) {
        findComment.unlikes = findComment.unlikes.filter(item => item != userId);
        findComment.likes = [...findComment.likes, userId];
      } else if (likeValue === false) {
        findComment.likes = findComment.likes.filter(item => item != userId);
      }
      const newComment = await findComment.save();
      console.log(newComment)
      res.status(200).send({ comment: newComment });
    } else {
      res.status(400).json({ error: "코멘트를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const unlikeComment = async (req, res) => {
  const {
    body: { data },
    params: { commentId }
  } = req;
  const userId = data.userId;
  const unlikeValue = data.unlikeValue; // true or false
  try {
    const findComment = await Comment.findOne({
      _id: commentId
    });
    if (findComment) {
      if (unlikeValue) {
        findComment.likes = findComment.likes.filter(item => item != userId);
        findComment.unlikes = [...findComment.unlikes, userId];
      } else if (unlikeValue === false) {
        findComment.unlikes = findComment.unlikes.filter(item => item != userId);
      }
      const newComment = await findComment.save();
      console.log(newComment)
      res.status(200).send({ comment: newComment });
    } else {
      res.status(400).json({ error: "코멘트를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const updateComment = async (req, res) => {
  const {
    body: { data },
    params: { commentId }
  } = req;
  try {
    const content = data.content;
    const findComment = await Comment.findOne({
      _id: commentId
    });
    if (findComment) {
      findComment.content = content;
      findComment.updatedAt = Date.now();
      const newComment = await findComment.save();
      res.status(200).send({ comment: newComment });
    } else {
      res.status(400).json({ error: "코멘트를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const deleteComment = async (req, res) => {
  const {
    body: { comment },
    params: { commentId }
  } = req;
  try {
    console.log(comment)
    const findBattle = await Battle.findOne({
      _id: comment.battleId
    });
    if (findBattle) {
      await Comment.findOneAndRemove({
        _id: commentId
      });
      findBattle.comments = findBattle.comments.filter(comment => comment._id != commentId);
      await findBattle.save();
      res.status(200).send({ comment });
    } else {
      res.status(400).json({ error: "코멘트를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
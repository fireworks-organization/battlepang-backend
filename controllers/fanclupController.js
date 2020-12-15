import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";

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
export const fanclups = async (req, res) => {
  const {
    query: { id, email, phone, count }
  } = req;
  console.log(id)
  console.log(email)
  console.log(phone)

  const populateList = ["watchedBattles", "bankAccountNumbers", {
    path: "likeBattles",
    populate: ["creator", {
      path: "subBattles",
      populate: ["creator"]
    }]
  },];
  let findOperate = {};
  let limit;
  if (id) {
    findOperate = addOperate(findOperate, "_id", id);
  }
  if (email) {
    findOperate = addOperate(findOperate, "email", email);
  }
  if (phone) {
    findOperate = addOperate(findOperate, "phone", phone);
  }
  if (count) {
    limit = count;
  }
  console.log(findOperate)
  try {
    const users = await User.find(findOperate).populate(populateList).limit(parseInt(limit));
    if (users) {
      return res.status(200).json({ users });
    } else {
      return res.status(400).json({ error: "아이디를 찾지 못했습니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

export const addFanclup = async (req, res, next) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const { follwToUserId, currentUserId } = data;
  try {
    const followUser = await User.findOne({ _id: follwToUserId });
    const currentUser = await User.findOne({ _id: currentUserId });
    if (!currentUser) {
      res.status(400).json({ error: "해당유저를 찾을 수 없습니다." });
      return false;
    }
    if (!followUser) {
      res.status(400).json({ error: "팬클럽 가입할 유저를 찾을 수 없습니다." });
      return false;
    }
    const isAlreadyFollow = currentUser.follows.filter(item => item === follwToUserId)[0];
    console.log(isAlreadyFollow)
    if (isAlreadyFollow) {
      currentUser.follows = currentUser.follows.filter(item => item != follwToUserId);
      followUser.followers = followUser.followers.filter(item => item != currentUserId);
    } else {
      currentUser.follows = [...currentUser.follows, follwToUserId];
      followUser.followers = [...followUser.followers, currentUserId];
    }
    await currentUser.save();
    await followUser.save();
    res.status(200).send({ currentUser, followUser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
    next();
  }
};
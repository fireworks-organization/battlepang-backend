import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";
import Battle from "../models/Battle";

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
export const fanclubs = async (req, res) => {
  const {
    query: { userId, count, sortBy }
  } = req;
  console.log("userId", userId);

  const populateList = ["creator", "votes", {
    path: "subBattles",
    populate: ["creator", "votes"]
  }, {
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: ["creator", "votes"]
    }];
  let findOperate = {};
  let limit;
  const sort = {}
  const findUser = await User.findOne({ _id: userId }).populate("follows");
  if (!findUser) {
    res.status(400).json({ error: "해당유저를 찾을 수 없습니다." });
    return false;
  }
  if (count) {
    limit = count;
  }
  if (sortBy) {
    const str = sortBy.split(':');
    console.log(str)
    if (str[0] == "likes") {
      str[0] = "likes.length"
    }
    sort[str[0]] = str[1] === 'desc' ? -1 : 1;
    console.log(sort)
  }

  if (findUser.follows.length > 0) {
    findOperate = [];
    findUser.follows.map(item => {
      findOperate.push({
        creator: item._id
      });
    })
    findOperate = { $or: findOperate };
    console.log(findOperate)
    try {
      let findBattles = [];
      findBattles = await Battle.find(findOperate).populate(populateList).limit(parseInt(limit)).sort(sort);

      console.log(findBattles.length)
      res.status(200).json({ battles: findBattles });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  } else {
    res.status(200).json({ battles: [] });
  }
};

export const addFanclub = async (req, res, next) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const { follwToUserId, currentUserId } = data;
  try {
    if (follwToUserId === currentUserId) {
      res.status(400).json({ error: "자신의 채널은 팬가입이 불가능합니다." });
      return false;
    }
    let followUser = await User.findOne({ _id: follwToUserId }).populate(["follows", "followers"]);
    let currentUser = await User.findOne({ _id: currentUserId }).populate(["follows", "followers"]);
    if (!currentUser) {
      res.status(400).json({ error: "해당유저를 찾을 수 없습니다." });
      return false;
    }
    if (!followUser) {
      res.status(400).json({ error: "팬클럽 가입할 유저를 찾을 수 없습니다." });
      return false;
    }
    const isAlreadyFollow = currentUser.follows.filter(item => item._id == follwToUserId)[0];

    if (isAlreadyFollow) {
      currentUser.follows = currentUser.follows.filter(item => item._id != follwToUserId);
      followUser.followers = followUser.followers.filter(item => item._id != currentUserId);
    } else {
      currentUser.follows = [...currentUser.follows.map(item => item._id), follwToUserId];
      followUser.followers = [...followUser.followers.map(item => item._id), currentUserId];
    }
    await currentUser.save();
    await followUser.save();
    followUser = await User.findOne({ _id: follwToUserId }).populate(["follows", "followers"]);
    currentUser = await User.findOne({ _id: currentUserId }).populate(["follows", "followers"]);

    res.status(200).send({ currentUser, followUser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
    next();
  }
};
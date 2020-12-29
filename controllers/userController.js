import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";
import mongoose from "mongoose";

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_PRIVATE_KEY,
  region: "ap-northeast-1"
});
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
export const users = async (req, res) => {
  const {
    query: { id, email, phone, count, sortBy }
  } = req;
  console.log(id)
  console.log(email)
  console.log(phone)

  const populateList = ["bankAccountNumbers", "follows", "followers", {
    path: "likeBattles",
    populate: ["creator", {
      path: "subBattles",
      populate: ["creator"]
    }]
  }, {
      path: "watchedBattles",
      populate: ["creator", {
        path: "subBattles",
        populate: ["creator"]
      }]
    }];
  let findOperate = {};
  let limit = {};
  const sort = { "$sort": {} };
  if (id) {
    findOperate = addOperate(findOperate, "_id", new mongoose.Types.ObjectId(id));
  }
  if (email) {
    findOperate = addOperate(findOperate, "email", email);
  }
  if (phone) {
    findOperate = addOperate(findOperate, "phone", phone);
  }

  console.log(findOperate)

  let aggregateQuery = [
    {
      $match: findOperate
    },
    {
      $addFields: {
        followsLength: {
          $size: { "$ifNull": ["$follows", []] }
        },
        followersLength: {
          $size: { "$ifNull": ["$followers", []] }
        }
      }
    },
  ]
  if (count) {
    limit = { $limit: parseInt(count) };
    aggregateQuery.push(limit)
  }
  if (sortBy) {
    const str = sortBy.split(':');
    console.log(str)
    if (str[0] == "follows") {
      str[0] = "followsLength"
    }
    if (str[0] == "followers") {
      str[0] = "followersLength"
    }
    sort["$sort"][str[0]] = str[1] === 'desc' ? -1 : 1;
    console.log(sort)
    aggregateQuery.push(sort)
  }

  console.log(aggregateQuery)


  try {
    let users = await User.aggregate(aggregateQuery);
    users = await User.populate(users, populateList);
    if (users.length != 0) {
      return res.status(200).json({ users });
    } else {
      return res.status(400).json({ error: "아이디를 찾지 못했습니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};


export const register = async (req, res, next) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const { email, name, phone, password, password2 } = data;
  if (password !== password2) {
    res.status(400).json({ error: "패스워드가 다릅니다." });
    next();
  } else {
    try {
      const findUser = await User.findOne({
        $or: [{ email }, { phone }],
      });
      if (findUser) {
        res.status(400).json({ error: "이미 가입된 이메일 or 핸드폰번호 입니다." });
      } else {

        const resetPasswordToken = makeid(12)
        const user = await User({
          email,
          name,
          phone,
          resetPasswordToken
        });
        await User.register(user, password);
        res.status(200).send(user);
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
      next();
    }
  }
};

export const login = async (req, res, next) => {
  const {
    body: { phone }
  } = req;
  const findUser = await User.findOne({ phone });
  if (!findUser) {
    console.log("존재하지 않는 아이디입니다")
    return res.status(400).json({ error: "존재하지 않는 아이디입니다" }); // 임의 에러 처리
  }
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) {
      console.log("에러발생:" + err)
      return res.status(400).json({ error: err });
    }
    if (!user) {
      if (info) {
        return res.status(400).send({
          error:
            info.toString().indexOf("Password or username is incorrect") != -1
              ? "비밀번호가 틀렸습니다."
              : info
        });
      }
    }
    req.login(user, { session: false }, err => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_SECRET_TIME
      });
      return res.status(200).json({
        user: {
          ...user._doc,
          loginType: "local"
        },
        token
      });
    });
  })(req, res);
};

export const authLoginNaverCallback = (req, res, next) => {
  const {
    body: { data }
  } = req;
  const { accessToken } = data;
  const api_url = "https://openapi.naver.com/v1/nid/me";
  var request = require("request");
  var options = {
    url: api_url,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  request.get(options, function (error, response, body) {
    const responseDatas = JSON.parse(body).response;
    console.log(responseDatas);
    if (!error && response.statusCode == 200) {
      const naverId = responseDatas.id;
      const avatarUrl = responseDatas.profile_image;
      const email = responseDatas.email;
      const name = responseDatas.name;
      snsLogin(req, res, "naver", {
        email,
        name,
        avatarUrl,
        naverId
      });
      //   res
      //     .status(200)
      //     .json({ ...responseDatas })
      //     .end();
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
};

export const authLoginKakaoCallback = (req, res, next) => {
  const {
    body: { data }
  } = req;
  const { email, name, kakaoId } = data;
  snsLogin(req, res, "kakao", {
    email,
    name,
    kakaoId
  });
};

const snsLogin = async (req, res, snsLoginType, userObj) => {
  let searchKey = {};
  switch (snsLoginType) {
    case "naver":
      searchKey = { naverId: userObj.naverId };
      break;
    case "kakao":
      searchKey = { kakaoId: userObj.kakaoId };
      break;

    default:
      break;
  }
  console.log(snsLoginType)
  let findUser = await User.findOne({ email: userObj.email });
  if (!findUser) {
    findUser = await User.findOne(searchKey);
  }
  passport.authenticate("local", { session: false }, async function (
    err,
    user,
    info
  ) {
    if (findUser) {
      //유저가 있으면 그 유저로 로그인후 jwt출력
      console.log("유저있음!!");
      if (snsLoginType == "kakao" && !findUser.kakaoId) {
        findUser.kakaoId = userObj.kakaoId;
        await findUser.save();
      }
      if (snsLoginType == "naver" && !findUser.naverId) {
        findUser.naverId = userObj.naverId;
        await findUser.save();
      }
      req.login(findUser, { session: false }, err => {
        if (err) {
          return res.status(400).json({ error: err });
        }
        const token = jwt.sign(findUser.toJSON(), process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_SECRET_TIME
        });
        return res.status(200).json({
          user: {
            ...findUser._doc,
            loginType: snsLoginType
          },
          token
        });
      });
    } else {
      console.log(userObj);
      //유저가 없으면 유저 회원가입 후 로그인 / jwt출력
      const user = new User(userObj);

      try {
        await user.save(function (error, user) {
          if (error) return res.status(400).json({ error });
          const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_SECRET_TIME
          });
          res.status(200).json({
            user: {
              ...user._doc,
              loginType: snsLoginType
            },
            token
          });
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    }
  })(req, res);
};

export const sendResetPasswordEmail = async (req, res) => {
  const {
    body: { email, phone },
    params: { userId }
  } = req;
  console.log("rest!!")
  console.log(process.env.EMAIL_ID)
  console.log(process.env.EMAIL_PASSWORD)
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
  });
  const resetPasswordToken = makeid(12);
  // const url = "http://localhost:8080"
  const url = "https://battlepang.com"
  const resetPasswordURL = `${url}/resetPassword?userId=${userId}&&resetPasswordToken=${resetPasswordToken}`;
  // send mail with defined transport object
  const user = await User.findOne({
    $and: [{ email }, { _id: userId }]
  });
  if (user) {
    try {
      user.resetPasswordToken = resetPasswordToken;
      await user.save();
      await transporter.sendMail({
        from: process.env.EMAIL_ID, // sender address
        to: email, // list of receivers
        subject: "비밀번호 변경 링크를 보내드립니다", // Subject line
        text:
          "안녕하세요 배틀팡 운영팀입니다. <br> 회원님의 비밀번호변경 링크는 <br/>" +
          resetPasswordURL +
          "<br/>입니다", // plain text body
        html:
          "안녕하세요 배틀팡 운영팀입니다. <br> 회원님의 비밀번호변경 링크는 <br/>" +
          resetPasswordURL +
          "<br/>입니다" // html body
      });
      return res.status(200).send({ message: "임시 비밀번호 발급 성공" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error });
    }
  } else {
    return res.status(400).json({ error: "이름과 이메일을 확인해주세요." });
  }
};

export const getUserInfo = async (req, res) => {
  const {
    params: { userId }
  } = req;
  const user = await User.findOne({ _id: userId }).populate("bankAccountNumbers");
  if (user) {
    return res.status(200).json({ user });
  } else {
    return res.status(400).json({ error: "해당 유저를 찾을 수 없습니다." });
  }
};
export const changeUserInfo = async (req, res) => {
  const {
    body: { email, name, phone, channelName },
    params: { userId },
    file
  } = req;
  console.log(file);
  console.log(userId, email, name, phone, channelName);
  // const id = data.id;
  const findUser = await User.findOne({ _id: userId });
  const avatarUrl = file ? file.location : undefined;
  try {
    if (email !== undefined) {
      findUser.email = email;
    }
    if (channelName !== undefined) {
      findUser.channelName = channelName;
      findUser.updatedDateOfChannelName = Date.now();
    }
    console.log(avatarUrl)
    if (avatarUrl !== undefined) {
      if (findUser.avatarUrl != "") {
        console.log("remove1")
        const currentImagePath = findUser.avatarUrl.split('com/avatar/')[1]
        await s3.deleteObject({
          Bucket: `fireworks-triple-star`,
          Key: `avatar/${currentImagePath}`
        }, function (err, data) {
          if (err) {
            console.log("이미지 삭제 실패")
            // return res.status(400).json({ error: "이미지 삭제 실패" });
          }
          console.log("data")
          console.log(data)
        })
      }
      findUser.avatarUrl = avatarUrl;
    }
    if (phone !== undefined) {
      findUser.phone = phone;
    }
    await findUser.save(function (error, user) {
      if (error) return res.status(400).json({ error });
      console.log(user)
      res.status(200).json({
        email: user.email,
        avatarUrl: user.avatarUrl,
        channelName: user.channelName,
        updatedDateOfChannelName: user.updatedDateOfChannelName,
        name: user.name,
        phone: user.phone,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};
export const checkUserPassword = async (req, res) => {
  const {
    body: { phone, password },
  } = req;
  console.log(phone);
  console.log(password);
  passport.authenticate("local", { session: false }, async function (
    error,
    user,
    info
  ) {
    if (error) {
      return res.status(400).json({ error });
    }
    if (info) {
      if (info.name == "IncorrectPasswordError") {
        return res.status(200).json({
          passwordValidation: false
        });
      }
      return res.status(400).json({ error: info });
    }
    const resetPasswordToken = makeid(12);
    const findUser = await User.findOne({
      $and: [{ _id: user._id }]
    });
    if (findUser) {
      findUser.resetPasswordToken = resetPasswordToken;
      await findUser.save();
      return res.status(200).json({
        resetPasswordToken,
        passwordValidation: true
      });
    }
  })(req, res);
};
export const resetUserPassword = async (req, res) => {
  const {
    body: { data },
    params: { userId },
  } = req;
  const password = data.password;
  try {
    console.log(userId)
    const resetPasswordToken = data.resetPasswordToken;
    const findUser = await User.findOne({
      _id: userId,
      resetPasswordToken
    });

    const newResetPasswordToken = makeid(12);
    if (findUser) {
      await findUser.setPassword(password);
      findUser.resetPasswordToken = newResetPasswordToken;
      await findUser.save();
      res.status(200).send({ user: findUser });
    } else {
      res.status(400).json({ error: "유저를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const checkResetPasswordToken = async (req, res) => {
  const {
    params: { userId },
    query: { resetPasswordToken }
  } = req;
  try {
    console.log(userId)
    console.log(resetPasswordToken)
    const findUser = await User.findOne({
      _id: userId,
      resetPasswordToken
    });

    console.log(findUser)

    if (findUser) {
      res.status(200).json({ result: true });
    } else {
      res.status(400).json({ result: false, error: "토큰을 확인해주세요." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const deleteUser = async (req, res) => {
  const {
    params: { userId },
    body: { secessionReason }
  } = req;
  try {
    const findUser = await User.findOne({
      _id: userId,
    });

    if (!findUser) {
      res.status(400).json({ error: "유저를 찾을 수 없습니다." });
    }
    findUser.deleteFlag = 1;
    findUser.deletedAt = Date.now();
    findUser.secessionReason = secessionReason ?? "";
    await findUser.save();
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

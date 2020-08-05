import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_PRIVATE_KEY,
  region: "ap-northeast-1"
});
export const users = (req, res) => res.send("Users");

export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "Log In" });

export const postJoin = async (req, res, next) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const { email, name, phone, password, password2 } = data;
  if (password !== password2) {
    res.status(400).send({ error: "패스워드가 다릅니다." });
    next();
  } else {
    try {
      const findUser = await User.findOne({
        email
      });
      if (findUser) {
        res.status(400).send({ error: "이미 가입된 이메일 입니다." });
      } else {
        const user = await User({
          email,
          name,
          phone
        });
        await User.register(user, password);
        res.status(200).send(user);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
      next();
    }
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Log In" });

export const postLogin = async (req, res, next) => {
  const {
    body: { email }
  } = req;
  const findUser = await User.findOne({ email: email });
  passport.authenticate("local", { session: false }, function (err, user, info) {
    console.log(email);
    if (err) {
      return res.status(400).send({ error: err });
    }
    if (!findUser)
      res.status(400).send({ error: "존재하지 않는 아이디입니다" }); // 임의 에러 처리
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
        return res.status(400).send({ error: err });
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
          if (error) return res.status(400).send({ error });
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
        return res.status(400).send({ error });
      }
    }
  })(req, res);
};

export const findEmail = async (req, res, next) => {
  const {
    body: { name, phone }
  } = req;
  try {
    const user = await User.findOne({ $and: [{ name }, { phone }] });
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(400).send({ error: "아이디를 찾지 못했습니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error });
  }
};

export const resetPassword = async (req, res) => {
  const {
    body: { email, name, phone }
  } = req;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
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
  const tmpPassword = makeid(6);
  // send mail with defined transport object
  const user = await User.findOne({
    $and: [{ email }, { name }, { phone }]
  });
  if (user) {
    try {
      await user.setPassword(tmpPassword);
      user.save();
      let info = await transporter.sendMail({
        from: process.env.EMAIL_ID, // sender address
        to: email, // list of receivers
        subject: "임시 비밀번호 발급", // Subject line
        text:
          "안녕하세요 운영팀입니다. <br> 회원님의 임시 비밀번호는 <b>" +
          tmpPassword +
          "</b>입니다", // plain text body
        html:
          "안녕하세요 운영팀입니다. <br> 회원님의 임시 비밀번호는 <b>" +
          tmpPassword +
          "</b>입니다" // html body
      });
      return res.status(200).send({ message: "임시 비밀번호 발급 성공" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: error });
    }
  } else {
    return res.status(400).send({ error: "이름과 이메일을 확인해주세요." });
  }
};

export const getUserInfo = async (req, res) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const id = data.id;
  const user = await User.findOne({ _id: id });
  if (user) {
    return res.status(200).json({ user });
  } else {
    return res.status(400).send({ error: "해당 유저를 찾을 수 없습니다." });
  }
};
export const changeUserInfo = async (req, res) => {
  const {
    body: { id, email, name, phone, channelName },
    file
  } = req;
  console.log(file);
  const avatarUrl = file ? file.location : '';
  console.log(id, email, name, phone, channelName);
  // const id = data.id;
  const findUser = await User.findOne({ _id: id });
  try {
    if (email !== undefined) {
      findUser.email = email;
    }
    if (channelName !== undefined) {
      findUser.channelName = channelName;
      findUser.updatedDateOfChannelName = Date.now();
    }
    if (avatarUrl !== undefined) {
      if (findUser.avatarUrl != "") {
        const currentImagePath = findUser.avatarUrl.split('com/avatar/')[1]
        await s3.deleteObject({
          Bucket: `fireworks-triple-star`,
          Key: `avatar/${currentImagePath}`
        }, function (err, data) {
          if (err) {
            console.log("이미지 삭제 실패")
            // return res.status(400).send({ error: "이미지 삭제 실패" });
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
    if (phone !== undefined) {
      findUser.phone = phone;
    }
    await findUser.save(function (error, user) {
      if (error) return res.status(400).send({ error });
      res.status(200).json({
        email,
        avatarUrl,
        channelName,
        updatedDateOfChannelName: Date.now(),
        name,
        phone
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error });
  }
};
export const checkUserPassword = async (req, res) => {
  const {
    body: { email, password }
  } = req;
  console.log(email);
  console.log(password);
  passport.authenticate("local", { session: false }, function (
    error,
    user,
    info
  ) {
    console.log(error);
    console.log(user);
    console.log(info);
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
    return res.status(200).json({
      passwordValidation: true
    });
  })(req, res);
};
export const changeUserPassword = async (req, res) => {
  const {
    body: { data }
  } = req;
  const email = data.email;
  const password = data.password;
  try {
    const findUser = await User.findOne({
      email
    });
    if (findUser) {
      await findUser.setPassword(password);
      findUser.save();
      res.status(200).send({ user: findUser });
    } else {
      res.status(400).send({ error: "유저를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const deleteUser = async (req, res) => {
  const {
    body: { data }
  } = req;
  const id = data.id;
  try {
    const user = await User.findOneAndRemove({ _id: id });
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
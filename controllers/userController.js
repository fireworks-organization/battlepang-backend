import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";
dotenv.config();

export const users = (req, res) => res.send("Users");
export const userDetail = (req, res) => res.send("User Detail");
export const editProfile = (req, res) => res.send("Edit Profile");
export const changePassword = (req, res) => res.send("Change Password");

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
        next();
      } else {
        const user = await User({
          email,
          name,
          phone
        });
        await User.register(user, password);
        res.status(200).send(user);
        next();
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
  passport.authenticate("local", { session: false }, function(err, user, info) {
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
  console.log(accessToken);
  request.get(options, function(error, response, body) {
    const responseDatas = JSON.parse(body).response;
    console.log(responseDatas);
    if (!error && response.statusCode == 200) {
      const naverId = responseDatas.id;
      snsLogin(req, res, "naver", {
        email: "",
        name: "",
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
  let findUser = await User.findOne({ email: userObj.email });
  if (!findUser) {
    findUser = await User.findOne(searchKey);
  }
  passport.authenticate("local", { session: false }, async function(
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
      const user = new User({
        email: "crowner.v0@gmail.com",
        name: "CROWN",
        kakaoId: 1372295663
      });

      try {
        await user.save(function(error, user) {
          if (error) return res.status(400).send({ error });
          const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_SECRET_TIME
          });
          res.status(200).json({
            user: {
              ...user,
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

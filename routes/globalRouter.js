import express from "express";
import routes from "../routes";
import passport from "passport";
import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

import dotenv from "dotenv";
dotenv.config();

const globalRouter = express.Router();
/* GET home page. */
multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  }
});

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_PRIVATE_KEY,
  region: "ap-northeast-1"
});

const multerAvatar = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "fireworks-triple-star/avatar"
  })
});
export const uploadAvatar = multerAvatar.single("avatarUrl");

import {
  home,
  search,
  join,
  login,
  logout
} from "../controllers/globalController";
import {
  postJoin,
  postLogin,
  findEmail,
  resetPassword,
  getUserInfo,
  authLoginNaverCallback,
  authLoginKakaoCallback,
  changeUserInfo,
  checkUserPassword,
  changeUserPassword,
  deleteUser
} from "../controllers/userController";

const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);
globalRouter.get(routes.join, join);
globalRouter.post(routes.join, postJoin);
globalRouter.get(routes.login, login);
globalRouter.post(routes.login, postLogin);
globalRouter.post(routes.findEmail, findEmail);
globalRouter.post(routes.resetPassword, resetPassword);
globalRouter.post(routes.getUserInfo, checkJWTAuthenticate, getUserInfo);
globalRouter.post(routes.authLoginNaverCallback, authLoginNaverCallback);
globalRouter.post(routes.authLoginKakaoCallback, authLoginKakaoCallback);

globalRouter.post(
  routes.changeUserInfo,
  checkJWTAuthenticate,
  uploadAvatar,
  changeUserInfo
);
globalRouter.post(
  routes.checkUserPassword,
  checkJWTAuthenticate,
  checkUserPassword
);
globalRouter.post(
  routes.changeUserPassword,
  checkJWTAuthenticate,
  changeUserPassword
);
globalRouter.post(routes.deleteUser, checkJWTAuthenticate, deleteUser);

export default globalRouter;

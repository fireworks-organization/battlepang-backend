import express from "express";
import routes from "../routes";
import passport from "passport";
import multer from "multer";

const globalRouter = express.Router();
/* GET home page. */
multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  }
});
const uploader = multer({
  dest: "./public/userAvatars/"
});

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
  changeUserPassword
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
  uploader.any(),
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

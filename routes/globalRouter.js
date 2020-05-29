import express from "express";
import routes from "../routes";
import passport from "passport";
const globalRouter = express.Router();
/* GET home page. */

import {
  home,
  search,
  join,
  login,
  logout,
  authLoginNaverCallback
} from "../controllers/globalController";
import {
  postJoin,
  postLogin,
  findEmail,
  resetPassword,
  getUserInfo
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

export default globalRouter;

import express from "express";
import routes from "../routes";
const globalRouter = express.Router();
/* GET home page. */

import {
  home,
  search,
  join,
  login,
  logout
} from "../controllers/globalController";
import {
  postJoin,
} from "../controllers/userController";

globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);
globalRouter.get(routes.join, join);
globalRouter.post(routes.join, postJoin);
globalRouter.get(routes.login, login);
globalRouter.get(routes.logout, logout);

export default globalRouter;

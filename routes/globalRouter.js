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

globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);
globalRouter.get(routes.join, join);
globalRouter.get(routes.login, login);
globalRouter.get(routes.logout, logout);

export default globalRouter;

import express from "express";
import routes from "../routes";
import passport from "passport";

import dotenv from "dotenv";
dotenv.config();

const globalRouter = express.Router();

import {
  home,
  stripePayment
} from "../controllers/globalController";
import {
  register,
  login,
  authLoginNaverCallback,
  authLoginKakaoCallback,
} from "../controllers/userController";

const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
globalRouter.get(routes.home, home);
globalRouter.post('/create-payment-intent', stripePayment);
globalRouter.post(routes.register, register);
globalRouter.post(routes.login, login);
globalRouter.post(routes.authLoginNaverCallback, authLoginNaverCallback);
globalRouter.post(routes.authLoginKakaoCallback, authLoginKakaoCallback);

export default globalRouter;

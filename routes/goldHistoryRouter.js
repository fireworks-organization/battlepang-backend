import express from "express";
import routes from "../routes";
import passport from "passport";
const goldHistoryRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
    goldHistory,
} from "../controllers/goldHistoryController";
goldHistoryRouter.get("/", goldHistory);

export default goldHistoryRouter;

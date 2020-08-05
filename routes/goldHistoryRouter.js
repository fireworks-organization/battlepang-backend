import express from "express";
import routes from "../routes";
import passport from "passport";
const goldHistoryRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
    goldHistory,
    addGoldHistory,
    updateGoldHistory,
} from "../controllers/goldHistoryController";
goldHistoryRouter.get("/", checkJWTAuthenticate, goldHistory);
goldHistoryRouter.post("/", checkJWTAuthenticate, addGoldHistory); //add gold history
goldHistoryRouter.put(routes.updateGoldHistory, checkJWTAuthenticate, updateGoldHistory); //add gold history

export default goldHistoryRouter;

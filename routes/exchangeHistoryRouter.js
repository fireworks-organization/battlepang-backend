
import express from "express";
import routes from "../routes";
import passport from "passport";
const exchangeHistoryRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
    exchangeHistory,
    addExchangeHistory,
    updateExchangeHistory,
} from "../controllers/exchangeHistoryController";
exchangeHistoryRouter.get("/", exchangeHistory);
exchangeHistoryRouter.post("/", checkJWTAuthenticate, addExchangeHistory); //add exchange history
exchangeHistoryRouter.put(routes.updateExchangeHistory, updateExchangeHistory); //add exchange history

export default exchangeHistoryRouter;

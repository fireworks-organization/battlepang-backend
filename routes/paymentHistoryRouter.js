import express from "express";
import routes from "../routes";
import passport from "passport";
const paymentHistoryRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
    paymentHistory,
    addPaymentHistory,
    updatePaymentHistory,
} from "../controllers/paymentHistoryController";
paymentHistoryRouter.get("/", paymentHistory);
paymentHistoryRouter.post("/", checkJWTAuthenticate, addPaymentHistory); //add payment history
paymentHistoryRouter.put(routes.updatePaymentHistory, checkJWTAuthenticate, updatePaymentHistory); //add payment history

export default paymentHistoryRouter;

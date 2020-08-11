import express from "express";
import routes from "../routes";
import passport from "passport";
const bankAccountNumberRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
    bankAccountNumber,
    addBankAccountNumber
} from "../controllers/bankAccountNumberController";
bankAccountNumberRouter.get("/", bankAccountNumber);
bankAccountNumberRouter.post("/", checkJWTAuthenticate, addBankAccountNumber); //add payment history
// bankAccountNumberRouter.put(routes.updatePaymentHistory, checkJWTAuthenticate, updatePaymentHistory); //add payment history

export default bankAccountNumberRouter;

import express from "express";
import routes from "../routes";
import passport from "passport";
const fanClubRouter = express.Router();

import {
    fanclubs,
    addFanclub,
} from "../controllers/fanclubController";
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
fanClubRouter.get("/", fanclubs);
fanClubRouter.post("/", checkJWTAuthenticate, addFanclub);

export default fanClubRouter;

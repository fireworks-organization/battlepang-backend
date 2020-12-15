import express from "express";
import routes from "../routes";
import passport from "passport";
const fanClupRouter = express.Router();

import {
    fanclups,
    addFanclup,
} from "../controllers/fanclupController";
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
fanClupRouter.get("/", fanclups);
fanClupRouter.post("/", checkJWTAuthenticate, addFanclup);

export default fanClupRouter;

import express from "express";
import routes from "../routes";
import passport from "passport";
const rankRouter = express.Router();

import {
    ranks,
} from "../controllers/rankController";
rankRouter.get("/", ranks);

export default rankRouter;

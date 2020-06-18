import express from "express";
import routes from "../routes";
import passport from "passport";
const commentRouter = express.Router();

import { comments, addComment } from "../controllers/commentController";
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
commentRouter.get("/", comments);
commentRouter.post(routes.addComment, checkJWTAuthenticate, addComment);

export default commentRouter;

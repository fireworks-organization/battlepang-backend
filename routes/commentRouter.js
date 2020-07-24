import express from "express";
import routes from "../routes";
import passport from "passport";
const commentRouter = express.Router();

import {
    comments,
    addComment,
    reportComment,
    likeComment,
    unlikeComment,
} from "../controllers/commentController";
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
commentRouter.get("/", comments);
commentRouter.post(routes.addComment, checkJWTAuthenticate, addComment);
commentRouter.post(routes.reportComment, checkJWTAuthenticate, reportComment);
commentRouter.post(routes.likeComment, checkJWTAuthenticate, likeComment);
commentRouter.post(routes.unlikeComment, checkJWTAuthenticate, unlikeComment);

export default commentRouter;

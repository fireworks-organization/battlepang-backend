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
    updateComment,
    deleteComment,
} from "../controllers/commentController";
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });
commentRouter.get("/", comments);
commentRouter.post(routes.addComment, checkJWTAuthenticate, addComment);
commentRouter.post(routes.reportComment, checkJWTAuthenticate, reportComment);
commentRouter.post(routes.likeComment, checkJWTAuthenticate, likeComment);
commentRouter.post(routes.unlikeComment, checkJWTAuthenticate, unlikeComment);
commentRouter.post(routes.updateComment, checkJWTAuthenticate, updateComment);
commentRouter.post(routes.deleteComment, checkJWTAuthenticate, deleteComment);

export default commentRouter;

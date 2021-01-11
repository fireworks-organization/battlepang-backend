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
commentRouter.post("/", checkJWTAuthenticate, addComment);
commentRouter.put(routes.updateComment, updateComment);
commentRouter.post(routes.reportComment, checkJWTAuthenticate, reportComment);
commentRouter.post(routes.likeComment, checkJWTAuthenticate, likeComment);
commentRouter.delete(routes.deleteComment, deleteComment);

export default commentRouter;

import express from "express";
import routes from "../routes";
const commentRouter = express.Router();

import { comments, addComment } from "../controllers/commentController";

commentRouter.get("/", comments);
commentRouter.post(routes.addComment, addComment);

export default commentRouter;

import express from "express";
import routes from "../routes";
const userRouter = express.Router();
import { users } from "../controllers/userController";
userRouter.get("/", users);

export default userRouter;

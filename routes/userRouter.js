import express from "express";
import routes from "../routes";
const userRouter = express.Router();
import {
  users,
  userDetail,
  editProfile,
  changePassword,
} from "../controllers/userController";
userRouter.get("/", users);
userRouter.get(routes.userDetail, userDetail);
userRouter.get(routes.editProfile, editProfile);
userRouter.get(routes.changePassword, changePassword);

export default userRouter;

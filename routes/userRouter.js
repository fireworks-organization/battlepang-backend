import express from "express";
import routes from "../routes";
import passport from "passport";
import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const userRouter = express.Router();

import {
    sendResetPasswordEmail,
    users,
    changeUserInfo,
    checkUserPassword,
    checkResetPasswordToken,
    resetUserPassword,
    deleteUser
} from "../controllers/userController";

const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

/* GET home page. */
multer.diskStorage({
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.originalname);
    }
});

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_PRIVATE_KEY,
    region: "ap-northeast-1"
});

const multerAvatar = multer({
    storage: multerS3({
        s3,
        acl: "public-read",
        bucket: "fireworks-triple-star/avatar"
    })
});
export const uploadAvatar = multerAvatar.single("avatarUrl");


userRouter.post(routes.sendResetPasswordEmail, sendResetPasswordEmail);
userRouter.get('/', users);
userRouter.put(
    routes.changeUserInfo,
    checkJWTAuthenticate,
    uploadAvatar,
    changeUserInfo
);
userRouter.post(
    routes.checkUserPassword,
    checkJWTAuthenticate,
    checkUserPassword
);
userRouter.get(
    routes.checkResetPasswordToken,
    checkResetPasswordToken
);
userRouter.put(
    routes.resetUserPassword,
    resetUserPassword
);
userRouter.delete(routes.deleteUser, deleteUser);

export default userRouter;

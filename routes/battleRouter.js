import express from "express";
import routes from "../routes";
import multer from "multer";
import passport from "passport";

const battleRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
  battles,
  addBattle,
  likeBattle,
  unlikeBattle,
  startBattle,
  refundBattle,
  voteBattle,
  reportBattle
} from "../controllers/battleController";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file.fieldname);
    if (file.fieldname === "videoFile") {
      cb(null, "./public/videoFiles/");
    } else {
      cb(null, "./public/thumbnails/");
    }
  }
});
const uploader = multer({ storage: storage });

battleRouter.get("/", battles);
battleRouter.post(routes.addBattle, uploader.any(), addBattle);
battleRouter.post(routes.likeBattle, checkJWTAuthenticate, likeBattle);
battleRouter.post(routes.unlikeBattle, checkJWTAuthenticate, unlikeBattle);
battleRouter.post(routes.startBattle, checkJWTAuthenticate, startBattle);
battleRouter.post(routes.refundBattle, checkJWTAuthenticate, refundBattle);
battleRouter.post(routes.voteBattle, checkJWTAuthenticate, voteBattle);
battleRouter.post(routes.reportBattle, checkJWTAuthenticate, reportBattle);

export default battleRouter;

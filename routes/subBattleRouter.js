import express from "express";
import routes from "../routes";
import multer from "multer";
import passport from "passport";

const subBattleRouter = express.Router();
const checkJWTAuthenticate = passport.authenticate("jwt", { session: false });

import {
  subBattles,
  addSubBattle,
} from "../controllers/subBattleController";
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

subBattleRouter.get("/", subBattles);
subBattleRouter.post(routes.addSubBattle, uploader.any(), addSubBattle);

export default subBattleRouter;

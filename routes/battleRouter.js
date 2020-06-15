import express from "express";
import routes from "../routes";
import multer from "multer";

const battleRouter = express.Router();

import { battles, addBattle } from "../controllers/battleController";
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
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

export default battleRouter;

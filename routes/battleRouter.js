import express from "express";
import routes from "../routes";
import multer from "multer";

const battleRouter = express.Router();

import { battles, addBattle } from "../controllers/battleController";
multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  }
});
const uploader = multer({
  dest: "./public/videoFiles/"
});

battleRouter.get("/", battles);
battleRouter.post(routes.addBattle, uploader.any(), addBattle);

export default battleRouter;

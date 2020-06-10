import express from "express";
import routes from "../routes";
const battleRouter = express.Router();
import { battles, addBattle } from "../controllers/battleController";
battleRouter.get("/", battles);
battleRouter.post(routes.addBattle, addBattle);

export default battleRouter;

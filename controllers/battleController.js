import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import routes from "../routes";
import Battle from "../models/Battle";
dotenv.config();

export const battles = async (req, res) => {
  try {
    const findBattles = await Battle.find();
    res.status(200).json({ battles: findBattles });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const battleDetail = (req, res) => res.send("Battle Detail");
export const editProfile = (req, res) => res.send("Edit Profile");
export const changePassword = (req, res) => res.send("Change Password");

export const addBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  console.log(data);
  const { battleObj } = data;
  try {
    const battle = new Battle(battleObj);
    await battle.save();
    res.status(200).send(battle);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

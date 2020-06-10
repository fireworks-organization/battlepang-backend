import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import routes from "../routes";

import Battle from "../models/Battle";

dotenv.config();

let Vimeo = require("vimeo").Vimeo;
let client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

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
    body: { battleObj }
  } = req;

  const videoFile = req.files
    .filter(item => item.fieldname == "videoFile")
    .map(file => "/videoFiles/" + file.filename)[0];
  let battleObjJSON = JSON.parse(battleObj);

  let file_name = "./public" + videoFile;
  client.upload(
    file_name,
    {
      name: battleObjJSON.title ? battleObjJSON.title : "Untitled",
      description: battleObjJSON.subTitle
    },
    async function(result) {
      const videoId = result.replace("/videos/", "");
      const uri = "https://player.vimeo.com/video/" + videoId;
      console.log("Your video URI is: " + uri);
      fs.unlinkSync(file_name);
      try {
        client.request(
          {
            method: "GET",
            path: `/videos/${videoId}/pictures`
          },
          function(error, body, status_code, headers) {
            if (error) {
              console.log(error);
            }

            console.log(body);
          }
        );
        battleObjJSON.videoUrl = uri;
        console.log(battleObjJSON);
        const battle = new Battle(battleObjJSON);
        await battle.save();
        res.status(200).send(battle);
      } catch (error) {
        console.log(error);
        res.status(400).send({ error });
      }
    },
    function(bytes_uploaded, bytes_total) {
      var percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
      console.log(bytes_uploaded, bytes_total, percentage + "%");
    },
    function(error) {
      console.log("Failed because: " + error);
    }
  );
  // console.log(data);
};

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
  const {
    query: { id, creator }
  } = req;
  console.log(id);
  try {
    let findBattles = [];
    if (id) {
      findBattles = await Battle.find({ _id: id }).populate({
        path: "comments",
        populate: {
          path: "creator"
        }
      });
      findBattles[0].views = findBattles[0].views + 1;
      findBattles[0].save();
    } else if (creator) {
      findBattles = await Battle.find({ creator }).populate({
        path: "comments",
        populate: {
          path: "creator"
        }
      });
    } else {
      findBattles = await Battle.find().populate({
        path: "comments",
        populate: {
          path: "creator"
        }
      });
    }

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

  let videoFileName = "./public" + videoFile;
  client.upload(
    videoFileName,
    {
      name: battleObjJSON.title ? battleObjJSON.title : "Untitled",
      description: battleObjJSON.subTitle
    },
    async function(result) {
      const videoId = result.replace("/videos/", "");
      const uri = "https://player.vimeo.com/video/" + videoId;
      console.log("Your video URI is: " + uri);
      fs.unlinkSync(videoFileName);
      try {
        battleObjJSON.videoUrl = uri;
        battleObjJSON.thumbnail = `https://i.vimeocdn.com/video/`;

        console.log(battleObjJSON);
        const battle = new Battle(battleObjJSON);
        await battle.save();
        res.status(200).send({ battle });
        function getVideoState() {
          //비디오 미리보기 이미지의 uri를 가져옴.
          client.request(
            {
              method: "GET",
              path: `/videos/${videoId}`
            },
            function(error, body, status_code, headers) {
              console.log(body.status);
              if (body.status != "available") {
                setTimeout(getVideoState, 2000);
              } else {
                // 비디오 섬네일 업로드 링크 가져오기.
                client.request(
                  {
                    method: "POST",
                    path: `/videos/${videoId}/pictures`,
                    query: { time: 0, active: true }
                  },
                  function(error, body, status_code, headers) {
                    if (error) {
                      console.log(error);
                    }
                    console.log(body);
                    battle.state = "transcoded";
                    battle.thumbnail = `https://i.vimeocdn.com/video/${body.uri
                      .replace("/videos/", "")
                      .replace(videoId, "")
                      .replace("/pictures/", "")}`;
                    battle.save();
                  }
                );
              }
            }
          );
        }

        setTimeout(getVideoState, 2000);
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

import passport from "passport";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";
import { stringify } from "querystring";

dotenv.config();

let Vimeo = require("vimeo").Vimeo;
let client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

export const battleDetail = (req, res) => res.send("Battle Detail");
export const editProfile = (req, res) => res.send("Edit Profile");
export const changePassword = (req, res) => res.send("Change Password");

export const battles = async (req, res) => {
  const {
    query: { id, creator, subBattleId }
  } = req;
  // console.log(id);
  // console.log(creator);
  // console.log(subBattleId);
  try {
    let findBattles = [];
    if (id && subBattleId) {
      // 아이디랑 서브 배틀함께 넘김
      // 배틀 상세에서 아이디만으로 찾아보고 없으면 배틀도 찾는다
      findBattles = await Battle.find({ _id: id })
        .populate("creator")
        .populate({
          path: "subBattles",
          populate: {
            path: "creator"
          }
        })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "creator"
          }
        });
      if (findBattles[0]) {
        findBattles[0].views = findBattles[0].views + 1;
        findBattles[0].save();
      } else {
        const findSubBattle = await SubBattle.find({
          _id: subBattleId
        }).populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "creator"
          }
        });
        if (findSubBattle) {
          findSubBattle[0].views = findSubBattle[0].views + 1;
          findSubBattle[0].save();
          findBattles = await Battle.find({ _id: findSubBattle[0].battleId })
            .populate("creator")
            .populate({
              path: "subBattles",
              populate: {
                path: "creator"
              }
            })
            .populate({
              path: "comments",
              options: { sort: { createdAt: -1 } },
              populate: {
                path: "creator"
              }
            });
          res
            .status(200)
            .json({ battles: findBattles, currentSubBattle: findSubBattle });
        }
      }
    } else if (id) {
      findBattles = await Battle.find({ _id: id })
        .populate("creator")
        .populate({
          path: "subBattles",
          populate: {
            path: "creator"
          }
        })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "creator"
          }
        });
      if (findBattles[0]) {
        findBattles[0].views = findBattles[0].views + 1;
        findBattles[0].save();
      }
    } else if (creator) {
      findBattles = await Battle.find({ creator })
        .populate("creator")
        .populate({
          path: "subBattles",
          populate: {
            path: "creator"
          }
        })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "creator"
          }
        });

      console.log("creator");
      const findSubBattle = await SubBattle.find({ creator });
      console.log(findSubBattle)
      if (findSubBattle) {
        res.status(200).json({ battles: findBattles, subBattles: findSubBattle });
        res.end();
      }
    } else if (subBattleId) {
      const findSubBattle = await SubBattle.find({ _id: subBattleId });
      if (findSubBattle) {
        findBattles = await Battle.find({ _id: findSubBattle[0].battleId })
          .populate("creator")
          .populate({
            path: "subBattles",
            populate: {
              path: "creator"
            }
          })
          .populate({
            path: "comments",
            options: { sort: { createdAt: -1 } },
            populate: {
              path: "creator"
            }
          });
        console.log(findBattles);
      }
    } else {
      findBattles = await Battle.find()
        .populate("creator")
        .populate({
          path: "subBattles",
          populate: {
            path: "creator"
          }
        })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
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
      description: battleObjJSON.description
    },
    async function (result) {
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
            function (error, body, status_code, headers) {
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
                  function (error, body, status_code, headers) {
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
    function (bytes_uploaded, bytes_total) {
      var percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
      console.log(bytes_uploaded, bytes_total, percentage + "%");
    },
    function (error) {
      console.log("Failed because: " + error);
    }
  );
  // console.log(data);
};
export const likeBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const battleId = data.battleId;
  const userId = data.userId;
  const likeValue = data.likeValue; // true or false
  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (findBattle) {
      if (likeValue) {
        findBattle.unlikes = findBattle.unlikes.filter(item => item != userId);
        findBattle.likes = [...findBattle.likes, userId];
      } else if (likeValue === false) {
        findBattle.likes = findBattle.likes.filter(item => item != userId);
      }
      await findBattle.save();
      res.status(200).send({ battle: findBattle });
    } else {
      const findSubBattle = await SubBattle.findOne({
        _id: battleId
      });

      if (findSubBattle) {
        if (likeValue) {
          findSubBattle.unlikes = findSubBattle.unlikes.filter(
            item => item != userId
          );
          findSubBattle.likes = [...findSubBattle.likes, userId];
        } else if (likeValue === false) {
          findSubBattle.likes = findSubBattle.likes.filter(
            item => item != userId
          );
        }
        await findSubBattle.save();
        res.status(200).send({ battle: findSubBattle });
      } else {
        res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
      }
    }
    JSON > stringify;
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const unlikeBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const battleId = data.battleId;
  const userId = data.userId;
  const unlikeValue = data.unlikeValue; // true or false
  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (findBattle) {
      if (unlikeValue) {
        findBattle.likes = findBattle.likes.filter(item => item != userId);
        findBattle.unlikes = [...findBattle.unlikes, userId];
      } else if (unlikeValue === false) {
        findBattle.unlikes = findBattle.unlikes.filter(item => item != userId);
      }
      await findBattle.save();
      res.status(200).send({ battle: findBattle });
    } else {
      const findSubBattle = await SubBattle.findOne({
        _id: battleId
      });

      if (findSubBattle) {
        if (unlikeValue) {
          findSubBattle.unlikes = [...findSubBattle.unlikes, userId];
          findSubBattle.likes = findSubBattle.likes.filter(
            item => item != userId
          );
        } else if (unlikeValue === false) {
          findSubBattle.unlikes = findSubBattle.unlikes.filter(
            item => item != userId
          );
        }
        await findSubBattle.save();
        res.status(200).send({ battle: findSubBattle });
      } else {
        res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const startBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const battleId = data.battleId;
  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (findBattle) {
      findBattle.battleStartTime = moment().format("YYYY-MM-DDTHH:mm:ss");
      await findBattle.save();
      res.status(200).send({ battle: findBattle });
    } else {
      res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

export const checkStartTimeAndDeletebattles = async (req, res) => {
  const {
    body: { data }
  } = req;
  const battleId = data.battleId;
  try {
    const allBattles = await Battle.find();
    allBattles;
    // for (let i = 0, len = battlesResult.length; i < len; i++) {
    // const currentBattle = battlesResult[i];
    // console.log(i);
    // console.log(JSON.stringify(currentBattle));
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

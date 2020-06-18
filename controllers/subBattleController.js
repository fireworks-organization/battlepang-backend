import dotenv from "dotenv";
import fs from "fs";

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";

dotenv.config();

let Vimeo = require("vimeo").Vimeo;
let client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

export const subBattles = async (req, res) => {
  const {
    query: { id, creator }
  } = req;
  console.log(id);
  try {
    let findSubBattles = [];
    if (id) {
      findSubBattles = await SubBattle.find({ _id: id }).populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "creator"
        }
      });
      findSubBattles[0].views = findSubBattles[0].views + 1;
      findSubBattles[0].save();
    } else if (creator) {
      findSubBattles = await SubBattle.find({ creator }).populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "creator"
        }
      });
    } else {
      findSubBattles = await SubBattle.find().populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "creator"
        }
      });
    }

    res.status(200).json({ subBattles: findSubBattles });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const addSubBattle = async (req, res) => {
  const {
    body: { subBattleObj }
  } = req;

  const videoFile = req.files
    .filter(item => item.fieldname == "videoFile")
    .map(file => "/videoFiles/" + file.filename)[0];
  let subBattleObjJSON = JSON.parse(subBattleObj);

  let videoFileName = "./public" + videoFile;
  console.log(videoFile);
  if (!videoFile) {
    const findBattle = await Battle.findOne({
      _id: subBattleObjJSON.battleId
    });
    if (findBattle) {
      const subBattle = new SubBattle(subBattleObjJSON);
      await subBattle.save();
      findBattle.subBattles = [...findBattle.subBattles, subBattle._id];
      await findBattle.save();
      res.status(200).send({ subBattle });
    } else {
      res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
    }
    return false;
  }
  client.upload(
    videoFileName,
    {
      name: subBattleObjJSON.title ? subBattleObjJSON.title : "Untitled",
      description: subBattleObjJSON.description
    },
    async function(result) {
      const videoId = result.replace("/videos/", "");
      const uri = "https://player.vimeo.com/video/" + videoId;
      console.log("Your video URI is: " + uri);
      fs.unlinkSync(videoFileName);
      try {
        subBattleObjJSON.videoUrl = uri;
        subBattleObjJSON.thumbnail = `https://i.vimeocdn.com/video/`;

        console.log(subBattleObjJSON);
        const subBattle = new SubBattle(subBattleObjJSON);
        await subBattle.save();
        res.status(200).send({ subBattle });
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
                    subBattle.state = "transcoded";
                    subBattle.thumbnail = `https://i.vimeocdn.com/video/${body.uri
                      .replace("/videos/", "")
                      .replace(videoId, "")
                      .replace("/pictures/", "")}`;
                    subBattle.save();
                  }
                );
              }
            }
          );

          setTimeout(getVideoState, 2000);
        }
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
export const updateSubBattle = async (req, res) => {
  const {
    body: { subBattleObj }
  } = req;

  const videoFile = req.files
    .filter(item => item.fieldname == "videoFile")
    .map(file => "/videoFiles/" + file.filename)[0];
  let subBattleObjJSON = JSON.parse(subBattleObj);

  let videoFileName = "./public" + videoFile;
  console.log(videoFile);
  console.log(subBattleObjJSON);
  client.upload(
    videoFileName,
    {
      name: subBattleObjJSON.title ? subBattleObjJSON.title : "Untitled",
      description: subBattleObjJSON.description
    },
    async function(result) {
      const videoId = result.replace("/videos/", "");
      const uri = "https://player.vimeo.com/video/" + videoId;
      console.log("Your video URI is: " + uri);
      fs.unlinkSync(videoFileName);
      try {
        subBattleObjJSON.videoUrl = uri;
        subBattleObjJSON.thumbnail = `https://i.vimeocdn.com/video/`;

        console.log(subBattleObjJSON);

        const subBattle = await SubBattle.findOne({
          _id: subBattleObjJSON._id
        });

        if (subBattle) {
          subBattle.title = subBattleObjJSON.title;
          subBattle.description = subBattleObjJSON.description;
          subBattle.thumbnail = subBattleObjJSON.thumbnail;
          subBattle.videoUrl = subBattleObjJSON.videoUrl;
          subBattle.state = subBattleObjJSON.state;
          await subBattle.save();
          res.status(200).send({ subBattle });
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
                      subBattle.state = "transcoded";
                      subBattle.thumbnail = `https://i.vimeocdn.com/video/${body.uri
                        .replace("/videos/", "")
                        .replace(videoId, "")
                        .replace("/pictures/", "")}`;
                      subBattle.save();
                    }
                  );
                }
              }
            );
          }
          setTimeout(getVideoState, 2000);
        }
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
export const likeSubBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const subBattleId = data.subBattleId;
  const userId = data.userId;
  const likeValue = data.likeValue; // true or false
  try {
    const findSubBattle = await SubBattle.findOne({
      _id: subBattleId
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
      res.status(200).send({ subBattle: findSubBattle });
    } else {
      res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const unlikeSubBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const subBattleId = data.subBattleId;
  const userId = data.userId;
  const unlikeValue = data.unlikeValue; // true or false
  try {
    const findSubBattle = await SubBattle.findOne({
      _id: subBattleId
    });
    if (findSubBattle) {
      if (unlikeValue) {
        findSubBattle.likes = findSubBattle.likes.filter(
          item => item != userId
        );
        findSubBattle.unlikes = [...findSubBattle.unlikes, userId];
      } else if (unlikeValue === false) {
        findSubBattle.unlikes = findSubBattle.unlikes.filter(
          item => item != userId
        );
      }
      await findSubBattle.save();
      res.status(200).send({ subBattle: findSubBattle });
    } else {
      res.status(400).send({ error: "배틀을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const joinSubBattle = async (req, res) => {
  const {
    body: { subBattleObj }
  } = req;

  let subBattleObjJSON = JSON.parse(subBattleObj);
  try {
    const subBattle = new SubBattle(subBattleObjJSON);
    await subBattle.save();
    res.status(200).send({ subBattle });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

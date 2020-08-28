import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

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
    res.status(400).json({ error });
  }
};
export const addSubBattle = async (req, res) => {
  const {
    body: { subBattleObj, battleTrimStartTime }
  } = req;

  const videoFile = req.files
    .filter(item => item.fieldname == "videoFile")[0];
  let subBattleObjJSON = JSON.parse(subBattleObj);

  if (!videoFile) {
    const findBattle = await Battle.findOne({
      _id: subBattleObjJSON.battleId
    });
    if (findBattle) {
      if (findBattle.joinCount >= findBattle.maxCount) {
        res.status(400).json({ error: "신청인원이 모두 찼습니다." });
      } else {
        const subBattle = new SubBattle(subBattleObjJSON);
        await subBattle.save();
        findBattle.joinCount = findBattle.joinCount + 1;
        findBattle.subBattles = [...findBattle.subBattles, subBattle._id];
        await findBattle.save();
        res.status(200).send({ subBattle });
      }
    } else {
      res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
    }
    return false;
  }
  // console.log(data);
};
export const updateSubBattle = async (req, res) => {
  const {
    body: { subBattleObj, battleTrimStartTime }
  } = req;

  const videoFile = req.files
    .filter(item => item.fieldname == "videoFile")[0];
  let subBattleObjJSON = JSON.parse(subBattleObj);

  let videoFileName = "./public/videoFiles/" + videoFile.filename;
  let newVideoFileName = "./public/videoFiles/converted-" + videoFile.filename + ".mp4";

  console.log(battleTrimStartTime)
  console.log(videoFileName)
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg(videoFileName)
    .setStartTime(battleTrimStartTime)
    .setDuration('30')
    .output(newVideoFileName)
    .on('end', function (err) {
      console.log(err)
      if (!err) {
        client.upload(
          newVideoFileName,
          {
            name: subBattleObjJSON.title ? subBattleObjJSON.title : "Untitled",
            description: subBattleObjJSON.description
          },
          async function (result) {
            const videoId = result.replace("/videos/", "");
            const uri = "https://player.vimeo.com/video/" + videoId;
            console.log("Your video URI is: " + uri);
            fs.unlinkSync(videoFileName);
            fs.unlinkSync(newVideoFileName);
            try {
              subBattleObjJSON.videoUrl = uri;
              subBattleObjJSON.thumbnail = `https://i.vimeocdn.com/video/`;

              console.log(subBattleObjJSON);

              const subBattle = await SubBattle.findOne({
                _id: subBattleObjJSON._id
              });

              if (subBattle) {
                const findBattle = await Battle.findOne({
                  _id: subBattle.battleId
                }).populate("subBattles");
                if (!findBattle) {
                  res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
                  return false;
                } else if (findBattle.joinCount >= findBattle.maxCount) {
                  const waitUploadBattle = findBattle.subBattles.filter(subBattle => subBattle.state == 'wait-upload');
                  console.log(waitUploadBattle)
                  if (waitUploadBattle.length == 0) {
                    findBattle.battleStartTime = moment().format("YYYY-MM-DDTHH:mm:ss");
                    findBattle.voteEndTime = moment().add(3, "days").format("YYYY-MM-DDTHH:mm:ss");
                    await findBattle.save();
                  }
                }

                subBattle.title = subBattleObjJSON.title;
                subBattle.description = subBattleObjJSON.description;
                subBattle.thumbnail = subBattleObjJSON.thumbnail;
                subBattle.videoUrl = subBattleObjJSON.videoUrl;
                subBattle.uploadedAt = Date.now();
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
              res.status(400).json({ error });
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
      }
    })
    .on('error', function (err) {
      console.log('error: ', err)
    }).run()


  // console.log(data);
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
    res.status(400).json({ error });
  }
};

export const refundSubBattle = async (req, res) => {
  const {
    body: { data }
  } = req;
  const refundSubBattle = data.refundSubBattle;
  const subBattleId = refundSubBattle._id;
  try {
    const findBattle = await Battle.findOne({
      _id: refundSubBattle.battleId
    });
    if (findBattle) {

      findBattle.joinCount = findBattle.joinCount - 1;
      findBattle.subBattles = findBattle.subBattles.filter(item => item._id != subBattleId);
      await findBattle.save();

      const findSubBattle = await SubBattle.findOneAndRemove({
        _id: subBattleId
      });
      res.status(200).send({ subBattle: findSubBattle });
    } else {
      res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

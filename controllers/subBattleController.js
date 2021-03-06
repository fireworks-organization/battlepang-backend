import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";
import GoldHistory from "../models/GoldHistory"
import User from "../models/User"

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
// export const addSubBattle = async (req, res) => {
//   const {
//     body: { subBattleObj, videoCutToStartTime }
//   } = req;

//   const videoFile = req.files
//     .filter(item => item.fieldname == "videoFile")[0];
//   let subBattleObjJSON = JSON.parse(subBattleObj);

//   if (!videoFile) {
//     const findBattle = await Battle.findOne({
//       _id: subBattleObjJSON.battleId
//     });
//     if (findBattle) {
//       if (findBattle.joinCount >= findBattle.maxCount) {
//         res.status(400).json({ error: "신청인원이 모두 찼습니다." });
//       } else {
//         const subBattle = new SubBattle(subBattleObjJSON);
//         await subBattle.save();
//         findBattle.joinCount = findBattle.joinCount + 1;
//         findBattle.subBattles = [...findBattle.subBattles, subBattle._id];
//         await findBattle.save();
//         res.status(200).send({ subBattle });
//       }
//     } else {
//       res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
//     }
//     return false;
//   }
//   // console.log(data);
// };
export const addSubBattle = async (req, res) => {
  const {
    body: { subBattleObj, videoCutToStartTime, gold }
  } = req;

  let subBattleObjJSON = JSON.parse(subBattleObj);

  const videoFile = req.files ?
    req.files.filter(item => item.fieldname == "videoFile")[0] : null;
  const thumbnailFile = req.files ?
    req.files.filter(item => item.fieldname == "thumbnail")[0] : null;
  console.log(thumbnailFile)

  let videoFileName = "./public/videoFiles/";
  if (videoFile) {
    videoFileName = videoFileName + videoFile.filename;
  }

  if (subBattleObjJSON.videoFileName) {
    videoFileName = videoFileName + subBattleObjJSON.videoFileName;
  }
  let newVideoFileName = "./public/videoFiles/converted-";
  if (videoFile) {
    newVideoFileName = newVideoFileName + videoFile.filename + ".mp4";
  }

  if (subBattleObjJSON.videoFileName) {
    newVideoFileName = newVideoFileName + subBattleObjJSON.videoFileName;
  }
  try {
    const findBattle = await Battle.findOne({
      _id: subBattleObjJSON.battleId
    });
    console.log("findBattle", findBattle);
    if (findBattle) {
      if (findBattle.state != "wait-battle") {
        console.log("도전을 기다리는 배틀이 아닙니다.")
        res.status(400).json({ error: "도전을 기다리는 배틀이 아닙니다." });
      } else if (findBattle.joinCount >= findBattle.maxCount) {
        console.log("신청인원이 모두 찼습니다.")
        res.status(400).json({ error: "신청인원이 모두 찼습니다." });
      } else {
        // if (subBattleObjJSON.videoFileName) {
          vimeoUploadAndWatchingToTrancoded(videoFileName, subBattleObjJSON);
        // } else {
        //   ffmpeg.setFfmpegPath(ffmpegPath);
        //   ffmpeg(videoFileName)
        //     .setStartTime(videoCutToStartTime)
        //     .setDuration('30')
        //     .output(newVideoFileName)
        //     .on('end', function (err) {
        //       console.log(err)
        //       if (!err) {
        //         if (!subBattleObjJSON.videoFileName) {
        //           fs.unlinkSync(videoFileName);
        //         }
        //         vimeoUploadAndWatchingToTrancoded(newVideoFileName, subBattleObjJSON)
        //       }
        //     })
        //     .on('error', function (err) {
        //       console.log('error: ', err)
        //     }).run()
        // }
      }
    } else {
      console.log("배틀을 찾을 수 없습니다.")
      res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
    }

    async function vimeoUploadAndWatchingToTrancoded(uploadFileName, subBattleObjJSON) {
      console.log("vimeoUploadAndWatchingToTrancoded")

      let subBattle = new SubBattle(subBattleObjJSON);
      await subBattle.save();
      findBattle.joinCount = findBattle.joinCount + 1;
      findBattle.subBattles = [...findBattle.subBattles, subBattle._id];
      await findBattle.save();

      client.upload(
        uploadFileName,
        {
          name: subBattle.title ? subBattle.title : "Untitled",
          description: subBattle.description
        },
        async function (result) {
          const videoId = result.replace("/videos/", "");
          const uri = "https://player.vimeo.com/video/" + videoId;
          console.log("Your video URI is: " + uri);
          if (!subBattleObjJSON.videoFileName) {
            fs.unlinkSync(uploadFileName);
          }
          try {
            subBattle.videoUrl = uri;
            // subBattle.thumbnail = `https://i.vimeocdn.com/video/`;
            console.log(subBattle);

            if (thumbnailFile) {
              var bitmap = fs.readFileSync(thumbnailFile.path);
              let base64Data = new Buffer.from(bitmap).toString('base64');
              subBattle.thumbnail = "data:image/png;base64," + base64Data;
              await subBattle.save();
              fs.unlinkSync(thumbnailFile.path);
            } else {
              subBattle.thumbnail = `https://i.vimeocdn.com/video/`;
              await subBattle.save();
            }
            const findUser = await User.findOne({
              _id: subBattleObjJSON.creator
            });
            console.log("findUser", findUser);
            if (!findUser) {
              const error = "유저를 찾을 수 없습니다.";
              console.log(error)
              res.status(400).json({ error });
              return false;
            }
            console.log("gold", gold);
            const chargeGold = -1 * gold;
            console.log("chargeGold", chargeGold);
            const goldHistoryObj = {
              user: findUser._id,
              battle: findBattle._id,
              subBattle: subBattle._id,
              payment: null,
              chargeGold,
              beforeGold: findUser.gold,
              status: "join-battle",
              message: `배틀 참가 비용으로 ${chargeGold}G 결제`
            }
            const goldHistory = new GoldHistory(goldHistoryObj);
            const insertedGoldHistory = await goldHistory.save();
            findUser.gold = findUser.gold + chargeGold;
            await findUser.save();
            insertedGoldHistory.afterGold = findUser.gold;
            await insertedGoldHistory.save();

            console.log(findBattle.joinCount);
            console.log(findBattle.maxCount);
            if (findBattle.joinCount >= findBattle.maxCount) {
              findBattle.battleStartTime = moment().format("YYYY-MM-DDTHH:mm:ss");
              findBattle.state = "battling"
              findBattle.voteEndTime = moment().add(3, "days").format("YYYY-MM-DDTHH:mm:ss");
              await findBattle.save();
            }
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
                      async function (error, body, status_code, headers) {
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
    // console.log(data);
  }
  catch (error) {
    res.status(400).json({ error });
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
    res.status(400).json({ error });
  }
};
export const updateSubBattle = async (req, res) => {
  const {
    body: { battleId, title, description },
  } = req;
  try {
    const findBattle = await SubBattle.findOne({
      _id: battleId
    });
    if (!findBattle) {
      res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
      return false;
    }
    if (title !== undefined) {
      findBattle.title = title;
    }
    if (description !== undefined) {
      findBattle.description = description;
    }
    await findBattle.save(function (error, battle) {
      if (error) return res.status(400).json({ error });
      console.log(battle)
      res.status(200).json({ battle: { ...battle } });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }

};
export const deleteSubBattle = async (req, res) => {
  const {
    body: { _id, battleId }
  } = req;
  try {
    const findBattle = await Battle.findOne({_id: battleId});
    findBattle.subBattles = findBattle.subBattles.filter(el=>el != _id);
    findBattle.joinCount = findBattle.subBattles.length;
    await findBattle.save();
    const battle = await SubBattle.findOneAndRemove({ _id: _id });
    res.status(200).send({ battle });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};


import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

import Battle from "../models/Battle";
import SubBattle from "../models/SubBattle";
import Vote from "../models/Vote";
import Report from "../models/Report";
import User from "../models/User";
import GoldHistory from "../models/GoldHistory"

dotenv.config();

let Vimeo = require("vimeo").Vimeo;
let client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

const addOperate = (operate, key, value) => {
  console.log(operate)
  console.log((Object.keys(operate)))
  if (Object.keys(operate).length == 0) {
    operate[key] = value;
  } else {
    let array = [operate];
    let newObj = {};
    newObj[key] = value;
    array.push(newObj);
    operate = { $and: array };
  }
  return operate;
}

export const battles = async (req, res) => {

  const {
    query: { id, creator, subBattleId, state, count, userId, sortBy }
  } = req;
  console.log("id", id);
  console.log("creator", creator);
  console.log("subBattleId", subBattleId);
  console.log("state", state);
  console.log("count", count);
  console.log("userId", userId);

  const populateList = ["creator", "votes", {
    path: "subBattles",
    populate: ["creator", "votes"]
  }, {
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: ["creator", "votes"]
    }];
  let findOperate = {};
  let limit;
  const sort = {}

  if (id) {
    findOperate = addOperate(findOperate, "_id", id);
  }
  if (creator) {
    findOperate = addOperate(findOperate, "creator", creator);
  }
  if (subBattleId) {
    findOperate = addOperate(findOperate, "subBattleId", subBattleId);
  }
  if (state) {
    findOperate = addOperate(findOperate, "state", state);
  }
  if (count) {
    limit = count;
  }
  if (sortBy) {
    const str = sortBy.split(':');
    console.log(str)
    sort[str[0]] = str[1] === 'desc' ? -1 : 1;
    console.log(sort)
  }

  console.log(findOperate)
  console.log(limit)

  try {
    let findBattles = [];
    findBattles = await Battle.find(findOperate).populate(populateList).limit(parseInt(limit)).sort(sort);

    if (userId && id) {
      const findUser = await User.findOne({ _id: userId });
      if (!findUser) {
        res.status(400).json({ error: "시청기록을 기록할 유저가 없음." });
        res.end();
      }
      if (findUser.watchedBattles.indexOf(id) == -1) {
        findUser.watchedBattles = [...findUser.watchedBattles, id]
        await findUser.save();
      }
    }

    if (findBattles[0] && id) {
      findBattles[0].views = findBattles[0].views + 1;
      findBattles[0].save();
      // 다른 영상 12개를 추출하는데 
      // 현재 배틀 영상이랑 상태값이 타임오버, 변환중인 비디오는 제외한다

      const otherBattles = await Battle.find(
        { $and: [{ _id: { $nin: id } }, { state: { $nin: ["battling", "wait-battle", "time-over", "transcoding"] } }] }
      ).limit(12)
        .populate(populateList);

      res.status(200).json({ battles: findBattles, otherBattles });
      return false
    }
    res.status(200).json({ battles: findBattles });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const addBattle = async (req, res) => {
  const {
    body: { battleObj, videoCutToStartTime }
  } = req;
  const videoFile = req.files ?
    req.files.filter(item => item.fieldname == "videoFile")[0] : null;
  const thumbnailFile = req.files ?
    req.files.filter(item => item.fieldname == "thumbnail")[0] : null;
  console.log(thumbnailFile)
  let battleObjJSON = JSON.parse(battleObj);

  let videoFileName = "./public/videoFiles/";
  if (videoFile) {
    videoFileName = videoFileName + videoFile.filename;
  }

  if (battleObjJSON.videoFileName) {
    videoFileName = videoFileName + battleObjJSON.videoFileName;
  }
  let newVideoFileName = "./public/videoFiles/converted-";
  if (videoFile) {
    newVideoFileName = newVideoFileName + videoFile.filename + ".mp4";
  }

  if (battleObjJSON.videoFileName) {
    newVideoFileName = newVideoFileName + battleObjJSON.videoFileName;
  }
  try {
    if (battleObjJSON.videoFileName) {
      vimeoUploadAndWatchingToTrancoded(videoFileName, battleObjJSON);
    } else {
      ffmpeg.setFfmpegPath(ffmpegPath);
      // console.log(battleObjJSON)
      // console.log(videoFileName)
      // console.log(newVideoFileName)
      ffmpeg(videoFileName)
        .setStartTime(videoCutToStartTime)
        .setDuration('30')
        .output(newVideoFileName)
        .on('end', function (err) {
          if (!err) {
            if (!battleObjJSON.videoFileName) {
              fs.unlinkSync(videoFileName);
            }
            vimeoUploadAndWatchingToTrancoded(newVideoFileName, battleObjJSON);
          }
        })
        .on('error', function (err) {
          console.log('error: ', err)
        }).run()
    }

    function vimeoUploadAndWatchingToTrancoded(uploadFileName, battleObjJSON) {
      // console.log(uploadFileName)
      client.upload(
        uploadFileName,
        {
          name: battleObjJSON.title ? battleObjJSON.title : "Untitled",
          description: battleObjJSON.description
        },
        async function (result) {
          const videoId = result.replace("/videos/", "");
          const uri = "https://player.vimeo.com/video/" + videoId;
          console.log("Your video URI is: " + uri);
          if (!battleObjJSON.videoFileName) {
            fs.unlinkSync(uploadFileName);
          }
          try {
            battleObjJSON.videoUrl = uri;
            // battleObjJSON.thumbnail = `https://i.vimeocdn.com/video/`;

            const findUser = await User.findOne({
              _id: battleObjJSON.creator
            });
            console.log("findUser", findUser);
            if (!findUser) {
              const error = "유저를 찾을 수 없습니다.";
              console.log(error)
              res.status(400).json({ error });
              return false;
            }
            console.log(battleObjJSON);
            const battle = new Battle(battleObjJSON);
            await battle.save();
            if (thumbnailFile) {
              var bitmap = fs.readFileSync(thumbnailFile.path);
              let base64Data = new Buffer.from(bitmap).toString('base64');
              battle.thumbnail = "data:image/png;base64," + base64Data;
              battle.save();
              fs.unlinkSync(thumbnailFile.path);
            } else {
              battle.thumbnail = `https://i.vimeocdn.com/video/`;
              battle.save();
            }
            const gold = battleObjJSON.gold;
            const chargeGold = -1 * gold;
            console.log("chargeGold", chargeGold);
            const goldHistoryObj = {
              user: findUser._id,
              battle: battle._id,
              payment: null,
              chargeGold,
              beforeGold: findUser.gold,
              status: "create-battle",
              message: `배틀 생성 비용으로 ${chargeGold}G 결제`
            }
            const goldHistory = new GoldHistory(goldHistoryObj);
            const insertedGoldHistory = await goldHistory.save();
            findUser.gold = findUser.gold + chargeGold;
            await findUser.save();
            insertedGoldHistory.afterGold = findUser.gold;
            await insertedGoldHistory.save();
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
                        // battle.state = "wait-battle";
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
  } catch (error) {
    console.log(error)
    res.status(400).json({ error });
  }

  // console.log(data);
};

export const updateBattle = async (req, res) => {
  const {
    body: { state, battleStartTime, voteEndTime },
    params: { battleId },
  } = req;
  console.log(state)
  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (!findBattle) {
      res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
      return false;
    }

    if (state !== undefined) {
      findBattle.state = state;
    }
    if (battleStartTime !== undefined) {
      findBattle.battleStartTime = battleStartTime;
    }
    if (voteEndTime !== undefined) {
      findBattle.voteEndTime = voteEndTime;
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
          findSubBattle.likes = [...findSubBattle.likes, userId];
        } else if (likeValue === false) {
          findSubBattle.likes = findSubBattle.likes.filter(
            item => item != userId
          );
        }
        await findSubBattle.save();
        res.status(200).send({ battle: findSubBattle });
      } else {
        res.status(400).json({ error: "배틀을 찾을 수 없습니다." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const voteBattle = async (req, res) => {
  const {
    body: { voteObj },
    params: { battleId }
  } = req;
  console.log(battleId)
  console.log(voteObj)
  try {
    let findBattle = await Battle.findOne({
      _id: battleId
    }).populate("votes");
    if (findBattle) {
      console.log(findBattle)
      if (findBattle.creator == voteObj.creator) {
        res.status(400).json({ error: "자신의 배틀에는 투표할 수 없습니다." });
        return false;
      }
      if (findBattle.votes.filter(vote => vote.creator == voteObj.creator)[0]) {
        res.status(400).json({ error: "이미 투표한 배틀입니다." });
        return false;
      }
      const vote = new Vote(voteObj);
      const addedVoteObj = await vote.save();
      findBattle.votes = findBattle.votes = [...findBattle.votes, addedVoteObj._id];
      await findBattle.save();
      res.status(200).send({ voteObj: addedVoteObj });
    } else {
      const findBattle = await Battle.findOne({
        subBattles: battleId
      }).populate("votes");
      if (findBattle) {
        if (findBattle.creator == voteObj.creator) {
          res.status(400).json({ error: "자신의 배틀에는 투표할 수 없습니다." });
          return false;
        }

        if (findBattle.votes.filter(vote => vote.creator == voteObj.creator)[0]) {
          res.status(400).json({ error: "이미 투표한 배틀입니다." });
          return false;
        }
        const vote = new Vote(voteObj);
        const addedVoteObj = await vote.save();
        findBattle.votes = findBattle.votes = [...findBattle.votes, addedVoteObj._id];
        await findBattle.save();
        res.status(200).send({ voteObj: addedVoteObj });
      } else {
        res.status(400).json({ error: "해당하는 배틀을 찾을 수 없습니다 투표실패." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const reportBattle = async (req, res) => {
  const {
    body: { data },
    params: { battleId }
  } = req;

  console.log(battleId)
  let reportObj = data.reportObj;
  console.log(reportObj)
  try {
    const findBattle = await Battle.findOne({
      _id: battleId
    });
    if (findBattle) {
      const report = new Report(reportObj);
      const addedReportObj = await report.save();
      res.status(200).send({ reportObj: addedReportObj });
    } else {
      const findSubBattle = await SubBattle.findOne({
        _id: battleId
      });
      if (findSubBattle) {
        console.log("findSubBattle")
        reportObj.subBattlesId = battleId;
        delete reportObj.battleId;
        const report = new Report(reportObj);
        const addedReportObj = await report.save();
        res.status(200).send({ reportObj: addedReportObj });
      } else {
        res.status(400).json({ error: "신고 실패 에러가 발생하였습니다." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

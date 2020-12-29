import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  channelName: {
    type: String,
    default: "채널명 없음"
  },
  avatarUrl: {
    type: String,
    default: "https://fireworks-triple-star.s3.ap-northeast-2.amazonaws.com/default-user-white.png"
  },
  updatedDateOfChannelName: Date,
  phone: String,
  sex: String,
  kakaoId: Number,
  naverId: Number,
  facebookId: Number,
  googleId: Number,
  gold: {
    type: Number,
    default: 0
  },
  permission: {
    type: String,
    default: "public"
  },
  bankAccountNumbers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccountNumber",
    default: []
  }],
  resetPasswordToken: {
    type: String,
    default: ""
  },
  watchedBattles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle",
    default: []
  }],
  likeBattles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle",
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  follows: [{// 내가 팬으로 등록한 사람들
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  followers: [{//나를 팬으로 등록한 사람들
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  deleteFlag: {
    type: Number,
    default: 0
  },
  deletedAt: Date,
  secessionReason: {
    type: String,
    default: ""
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "phone" });

const model = mongoose.model("User", UserSchema);

export default model;

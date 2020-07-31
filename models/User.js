import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  channelName: {
    type: String,
    default: ""
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
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const model = mongoose.model("User", UserSchema);

export default model;

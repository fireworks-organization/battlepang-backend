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
    default: ""
  },
  phone: String,
  sex: String,
  kakaoId: Number,
  naverId: Number,
  facebookId: Number,
  googleId: Number
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const model = mongoose.model("User", UserSchema);

export default model;

import mongoose from "mongoose";

const SubBattleSchema = new mongoose.Schema({
  videoUrl: String,
  thumbnail: String,
  title: String,
  subTitle: String,
  gold: Number,
  description: String,
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const model = mongoose.model("SubBattle", SubBattleSchema);

export default model;

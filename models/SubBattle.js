import mongoose from "mongoose";

const SubBattleSchema = new mongoose.Schema({
  videoUrl: String,
  thumbnail: String,
  title: String,
  gold: Number,
  description: String,
  state: {
    type: String,
    default: "wait-upload"
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle"
  },
});

const model = mongoose.model("SubBattle", SubBattleSchema);

export default model;

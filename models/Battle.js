import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema({
  videoUrl: String,
  thumbnail: String,
  title: String,
  description: String,
  category1: String,
  category2: String,
  reviewCriteria: String,
  pro: Boolean,
  ageLimit: Boolean,
  gold: Number,
  joinCount: {
    type: Number,
    default: 0
  },
  maxCount: {
    type: Number,
    default: 2
  },
  state: {
    type: String,
    default: "wait-battle"
  },
  battleStartTime: String,
  voteEndTime: String,
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
  },
  subBattles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubBattle"
    }
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vote"
    }
  ]
});

const model = mongoose.model("Battle", BattleSchema);

export default model;

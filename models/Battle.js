import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema({
  videoUrl: String,
  thumbnail: String,
  title: String,
  tags: [
    {
      type: String
    }
  ],
  subTitle: String,
  gold: Number,
  joinCount: Number,
  maxCount: Number,
  state: String,
  battleStartTime: String,
  restOfDateTime: Date,
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
  },
  subBattles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubBattle"
    }
  ]
});

const model = mongoose.model("Battle", BattleSchema);

export default model;

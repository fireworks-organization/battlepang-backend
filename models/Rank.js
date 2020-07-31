import mongoose from "mongoose";

const RankSchema = new mongoose.Schema({
  rank: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  dateKeywordForSearch: String,
  categoryKeywordForSearch: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const model = mongoose.model("Rank", RankSchema);

export default model;

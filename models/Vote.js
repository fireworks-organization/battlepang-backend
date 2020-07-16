import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const model = mongoose.model("Vote", VoteSchema);

export default model;

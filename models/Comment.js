import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle"
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  unlikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
});

const model = mongoose.model("Comment", CommentSchema);

export default model;

import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle"
  },
  subBattlesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubBattle"
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  },
  content: {
    type: String,
    default: ""
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

const model = mongoose.model("Report", ReportSchema);

export default model;

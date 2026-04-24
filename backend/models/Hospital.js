import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: String,
  county: String
});

export default mongoose.model("Hospital", hospitalSchema);
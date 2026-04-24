import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  kmpdcPin: {
    type: String,
    required: true,
    trim: true
  },

  specialty: {
    type: String,
    default: ""
  },

  county: {
    type: String,
    default: ""
  },

  hospital: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);
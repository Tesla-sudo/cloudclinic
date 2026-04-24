import mongoose from "mongoose";

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },

  temperature: Number,
  heartRate: Number,

  recordedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Vital", vitalSchema);
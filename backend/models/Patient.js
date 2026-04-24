import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    age: Number,
    gender: String,
    county: String,

    // 🔥 NEW: CloudClinic IoT PIN
    patientPin: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
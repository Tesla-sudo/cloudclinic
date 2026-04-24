import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../models/Hospital.js";
import { hospitals } from "../data/hospitals.js";

dotenv.config();

const seedHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Hospital.deleteMany();
    await Hospital.insertMany(hospitals);

    console.log("✅ Hospitals Seeded");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedHospitals();
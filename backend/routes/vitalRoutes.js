import express from "express";
import {
  addVitals,
  getPatientVitals,
  getLatestVitals
} from "../controllers/vitalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// IoT / manual input
router.post("/", protect, addVitals);

// Historical data
router.get("/:patientId", protect, getPatientVitals);

// Latest reading (for dashboard)
router.get("/latest/:patientId", protect, getLatestVitals);

export default router;
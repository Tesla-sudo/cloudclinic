import express from "express";
import {
  registerDoctor,
  registerPatient,
  login
} from "../controllers/authController.js";

const router = express.Router();

router.post("/doctor/register", registerDoctor);
router.post("/patient/register", registerPatient);
router.post("/login", login);

export default router;
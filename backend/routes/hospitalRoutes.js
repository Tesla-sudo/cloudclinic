import express from "express";
import {
  getCounties,
  getHospitalsByCounty
} from "../controllers/hospitalController.js";

const router = express.Router();

router.get("/counties", getCounties);
router.get("/", getHospitalsByCounty);

export default router;
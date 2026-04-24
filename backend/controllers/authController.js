import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import generateToken from "../utils/generateToken.js";
import { validateKMPDCPin } from "../utils/validator.js";


// ================= 🔑 PATIENT PIN GENERATOR =================
const generatePatientPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// ================= DOCTOR REGISTER =================
export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      kmpdcPin,
      specialty,
      county,
      hospital
    } = req.body;

    // 🔴 BASIC VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (!kmpdcPin || !validateKMPDCPin(kmpdcPin)) {
      return res.status(400).json({
        message: "Invalid KMPDC PIN format"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: "doctor"
    });

    const doctor = await Doctor.create({
      user: user._id,
      kmpdcPin,
      specialty,
      county,
      hospital
    });

    return res.status(201).json({
      token: generateToken(user._id, user.role),
      user,
      doctor
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// ================= PATIENT REGISTER =================
export const registerPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      age,
      gender,
      county
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 🔥 GENERATE UNIQUE PATIENT PIN
    const patientPin = generatePatientPin();

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: "patient"
    });

    const patient = await Patient.create({
      user: user._id,
      age,
      gender,
      county,
      patientPin // 🔥 IMPORTANT
    });

    return res.status(201).json({
      token: generateToken(user._id, user.role),
      user,
      patient,
      patientPin // 🔥 send to frontend
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    return res.json({
      token: generateToken(user._id, user.role),
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
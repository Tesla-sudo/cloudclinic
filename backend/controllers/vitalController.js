import Vital from "../models/Vital.js";
import { checkVitals } from "../utils/alertEngine.js";
import { sendSMS } from "../utils/smsService.js";
import Patient from "../models/Patient.js";

// ================= ADD VITALS =================
export const addVitals = async (req, res) => {
  try {
    const { patientId, temperature, heartRate } = req.body;

    // basic validation (prevents silent DB corruption)
    if (!patientId || temperature == null || heartRate == null) {
      return res.status(400).json({
        message: "patientId, temperature and heartRate are required"
      });
    }

    const vital = await Vital.create({
      patient: patientId,
      temperature,
      heartRate,
      recordedAt: new Date()
    });

    // 🔥 ALERT ENGINE
    const alerts = checkVitals({ temperature, heartRate });

    if (alerts.length > 0) {
      const patient = await Patient.findById(patientId).populate("user");

      const phone = patient?.user?.phone;

      if (phone) {
        const message =
          `ALERT: ${alerts.join(", ")} | ` +
          `Temp: ${temperature}°C HR: ${heartRate}`;

        await sendSMS(phone, message);
      }
    }

    return res.status(201).json({
      success: true,
      vital,
      alerts
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET PATIENT VITALS =================
export const getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;

    const vitals = await Vital.find({ patient: patientId })
      .sort({ recordedAt: -1 });

    return res.json({
      success: true,
      count: vitals.length,
      vitals
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET LATEST VITAL =================
export const getLatestVitals = async (req, res) => {
  try {
    const { patientId } = req.params;

    const vital = await Vital.findOne({ patient: patientId })
      .sort({ recordedAt: -1 });

    return res.json({
      success: true,
      vital
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
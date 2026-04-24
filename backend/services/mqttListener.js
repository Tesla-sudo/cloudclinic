import mqttClient from "../config/mqtt.js";
import { checkVitals } from "../utils/alertEngine.js";
import Vital from "../models/Vital.js";
import Patient from "../models/Patient.js";
import { sendSMS } from "../utils/smsService.js";

export const initMQTTListener = (io) => {
  mqttClient.on("message", async (topic, message) => {
    if (topic !== "cloudclinic/vitals") return;

    const data = JSON.parse(message.toString());
    const { patientPin, temperature, heartRate } = data;

    try {
      const patient = await Patient.findOne({ patientPin }).populate("user");

      if (!patient) {
        console.log("Patient not found:", patientPin);
        return;
      }

      const vital = await Vital.create({
        patient: patient._id,
        temperature,
        heartRate
      });

      const alerts = checkVitals({ temperature, heartRate });

      if (alerts.length > 0) {
        const msg = `ALERT: ${alerts.join(", ")} | T:${temperature} HR:${heartRate}`;

        await sendSMS(patient.user.phone, msg);
      }

      io.emit("vitals-update", {
        patientPin,
        temperature,
        heartRate,
        alerts
      });

    } catch (err) {
      console.error("MQTT error:", err.message);
    }
  });
};
import mqtt from "mqtt";
import Vital from "../models/Vital.js";
import { checkVitals } from "../utils/alertEngine.js";
import { sendSMS } from "../utils/smsService.js";

const client = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
});

client.on("connect", () => {
  console.log("MQTT Connected");

  client.subscribe("cloudclinic/vitals");
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    const { patientId, temperature, heartRate } = data;

    const vital = await Vital.create({
      patient: patientId,
      temperature,
      heartRate
    });

    // ALERT ENGINE
    const alerts = checkVitals({ temperature, heartRate });

    if (alerts.length > 0) {
      const msg = `ALERT: ${alerts.join(", ")}`;
      await sendSMS("+254700000000", msg);
    }

    console.log("MQTT Data Saved:", vital);
  } catch (err) {
    console.error("MQTT Error:", err.message);
  }
});

export default client;
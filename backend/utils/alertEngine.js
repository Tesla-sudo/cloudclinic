export const checkVitals = (vitals) => {
  const alerts = [];

  if (!vitals) return alerts;

  if (vitals.temperature > 38) {
    alerts.push("High fever detected");
  }

  if (vitals.temperature < 35) {
    alerts.push("Hypothermia risk");
  }

  if (vitals.heartRate > 120) {
    alerts.push("Tachycardia detected");
  }

  if (vitals.heartRate < 50) {
    alerts.push("Bradycardia detected");
  }

  return alerts;
};
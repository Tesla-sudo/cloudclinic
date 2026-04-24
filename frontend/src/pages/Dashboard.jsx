import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    API.get("/vitals/123") // replace with real patientId
      .then(res => setVitals(res.data));
  }, []);

  const data = {
    labels: vitals.map(v => new Date(v.recordedAt).toLocaleTimeString()),
    datasets: [
      {
        label: "Heart Rate",
        data: vitals.map(v => v.heartRate),
      },
      {
        label: "Temperature",
        data: vitals.map(v => v.temperature),
      }
    ]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary">Doctor Dashboard</h1>

      <div className="bg-white p-4 rounded shadow mt-4">
        <Line data={data} />
      </div>
    </div>
  );
}
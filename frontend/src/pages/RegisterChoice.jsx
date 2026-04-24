import { Link } from "react-router-dom";

export default function RegisterChoice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">

      <div className="bg-white p-10 rounded-xl shadow text-center w-96">

        <h2 className="text-xl font-bold text-blue-600 mb-6">
          Register as
        </h2>

        <p className="text-gray-500 mb-6">
          Choose your role in CloudClinic system
        </p>

        <Link
          to="/register-doctor"
          className="block bg-blue-600 hover:bg-blue-700 text-white p-3 rounded mb-4 transition"
        >
          👨‍⚕️ Doctor
        </Link>

        <Link
          to="/register-patient"
          className="block bg-green-600 hover:bg-green-700 text-white p-3 rounded transition"
        >
          🧑‍🦽 Patient
        </Link>

      </div>

    </div>
  );
}
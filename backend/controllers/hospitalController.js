import Hospital from "../models/Hospital.js";

// GET all counties (for dropdown)
export const getCounties = async (req, res) => {
  try {
    const counties = await Hospital.distinct("county");
    res.json(counties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET hospitals by county
export const getHospitalsByCounty = async (req, res) => {
  try {
    const { county } = req.query;

    if (!county) {
      return res.status(400).json({ message: "County is required" });
    }

    const hospitals = await Hospital.find({ county }).sort({ name: 1 });

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
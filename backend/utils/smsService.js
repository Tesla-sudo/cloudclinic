import africastalking from "africastalking";

let at;

const initAT = () => {
  if (!at) {
    at = africastalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME
    });
  }
  return at;
};

export const sendSMS = async (to, message) => {
  try {
    const client = initAT();

    await client.SMS.send({
      to,
      message
    });

    console.log("SMS sent:", message);
  } catch (err) {
    console.error("SMS error:", err.message);
  }
};
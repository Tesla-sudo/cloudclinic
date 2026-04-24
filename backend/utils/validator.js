export const validateKMPDCPin = (pin) => {
  if (!pin) return false;

  const normalized = pin.toString().trim().toUpperCase();

  return /^KMPDC-\d{4,6}$/.test(normalized);
};
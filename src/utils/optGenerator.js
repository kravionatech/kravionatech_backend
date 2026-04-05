export const generateOTP = () => {
  const otp = Math.floor(Math.random() * 100000 + 100000);
  return otp;
};

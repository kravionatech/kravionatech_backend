import jwt from "jsonwebtoken";

export const authTokenGenerate = (payload) => {
  const token = {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    }),
    refreshToken: jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    }),
  };
  return token;
};

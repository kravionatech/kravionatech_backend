import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authTokenGenerate = (payload) => {
  const token = {
    accessToken: jwt.sign(payload, config.JWT_SECRET_KEY, {
      expiresIn: "15m",
    }),
    refreshToken: jwt.sign(payload, config.JWT_SECRET_KEY, {
      expiresIn: "7d",
    }),
  };
  return token;
};

import jwt from "jsonwebtoken";

export const authTokenGenerate = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY , { expiresIn: "7d" });
};

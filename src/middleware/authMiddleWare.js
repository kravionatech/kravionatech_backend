
import jwt from "jsonwebtoken";
import config from "../config/config.js";
export const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      message: "Unauthorized: No token provided",
      success: false 
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ 
          message: "Unauthorized: No token provided",
          success: false 
        });
    }
    // Verify the token using jsonwebtoken
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ 
        message: "Unauthorized: Invalid or expired token", 
        success: false,
        details: error.message 
      });
  }
};

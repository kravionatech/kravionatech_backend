import { token } from "morgan";
import { SubscriberModel } from "../models/subscriber.model.js";
import { UserModel } from "../models/user.model.js";
import { authTokenGenerate } from "../utils/authTokenGenerate.js";
import { DateAndTimeFormat } from "../utils/DateAndTimeFormat.js";
import {
  sendEmail,
  OTPSENDUI,
  LOGIN_NOTIFICATION_EMAIL_UI,
  WelcomeEmailUI,
  SubscriberWelcomeEmail,
} from "../utils/email.js";
import { generateOTP } from "../utils/optGenerator.js";
import bcrypt from "bcryptjs";
import { SessionModel } from "../models/session.model.js";
import { UAParser } from "ua-parser-js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

// ===============================
// Create New User Account
// ===============================
export const createAccount = async (req, res) => {
  // Extract user data from request body
  const { email, name, username, phone, password } = req.body;

  // ---------------------------------------
  // Check for empty required fields
  // ---------------------------------------
  const requiredField = { email, name, username, phone, password };

  for (let [key, value] of Object.entries(requiredField)) {
    if (!value) {
      return res.status(400).json({
        success: false,
        message: `${key} is required`,
      });
    }
  }

  try {
    // ---------------------------------------
    // Check if user already exists
    // (email, phone, or username)
    // ---------------------------------------
    const user = await UserModel.findOne({
      $or: [{ email }, { phone }, { username }],
    }).select("email username phone");

    if (user)
      return res.status(409).json({
        success: false,
        message: "User Already Exits (Email or Username or Phone Number ",
      });

    // ---------------------------------------
    // If user does not exist, create account
    // ---------------------------------------
    if (!user) {
      // Hash the password before saving
      const hashPassword = bcrypt.hashSync(password, 10);
      
      // Generate OTP
      const generatedOTP = generateOTP().toString();
      const hashedOTP = bcrypt.hashSync(generatedOTP, 10);

      // Create new user document
      const newUser = await UserModel({
        name,
        email,
        username,
        password: hashPassword,
        phone,

        // Store hashed OTP for account verification
        verification: {
          emailOtp: hashedOTP,
        },

        // Default user role
        role: "user",
      }).save();

      // add in subcriber list
      await SubscriberModel({ email }).save();

      // ----------------------------------------
      // Send Subscriber Welcome Email
      // ----------------------------------------
      await sendEmail({
        to: newUser.email,
        subject: "Welcome Subscriber",
        html: SubscriberWelcomeEmail({ email: newUser?.email }),
      });

      // ---------------------------------------
      // Send OTP verification email (send actual OTP, not hash)
      // ---------------------------------------
      await sendEmail({
        to: newUser.email,
        subject: "Account Verification code",
        html: OTPSENDUI(generatedOTP, newUser.email),
      });

      // ---------------------------------------
      // Response after sending OTP
      // ---------------------------------------
      return res.status(201).json({
        message: `Verification code sent to ${newUser.email}`,
        success: true,
      });
    }
  } catch (error) {
    // ---------------------------------------
    // Handle server errors
    // ---------------------------------------
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
     User Account Verification (OTP)
 =============================== */
export const accountCodeVerification = async (req, res) => {
  // Extract identifier (email/username/phone) and OTP from request body
  const { identifier, otp } = req.body;

  // Validate required fields
  if (!otp || !identifier) {
    return res.status(400).json({
      success: false,
      message: "OTP is required and identifier (email,username,phone)",
    });
  }

  try {
    // ---------------------------------------
    // Find user using email, phone or username
    // ---------------------------------------
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { username: identifier },
      ],
    }).select("email username phone verification role");

    // If user does not exist
    if (!user)
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });

    // ---------------------------------------
    // Check if user is already verified
    // ---------------------------------------
    if (user.isVerified || user.verification.isVerified === true)
      return res.status(400).json({
        success: false,
        message: "User Already Verified ",
      });

    // ---------------------------------------
    // Compare entered OTP with stored OTP
    // ---------------------------------------
    const matchOTP =
      bcrypt.compareSync(otp, user.verification.emailOtp || user.verification.phoneOtp);

    if (matchOTP) {
      // welcome message sent
      await sendEmail({
        to: user.email,
        subject: "Welcome to KRAVIONA",
        html: WelcomeEmailUI({
          userName: user.username,
        }),
      });

      // generate token access and refresh

      const token = await authTokenGenerate({
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
        phone: user.phone,
      });

      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();
      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip;
      // session id generate
      await new SessionModel({
        userID: user._id,
        refreshToken: token.refreshToken,
        deviceInfo: {
          browser: `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`,
          os: `${ua.os.name || "Unknown"} ${ua.os.version || ""}`,
          deviceType: ua.device.type || "desktop",
          deviceModel: ua.device.model || "Unknown",
          deviceVendor: ua.device.vendor || "Unknown",
        },

        ipAddress: ipAddress,
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        lastActiveAt: new Date(),
      }).save();

      // Clear OTP after successful verification
      user.verification.otp = null;

      // Mark verification status as true
      user.verification.isVerified = true;
      user.isVerified = true;

      // Save updated user document
      await user.save();

      return res.status(201).json({
        message: "Account Created Successfully",
        success: true,
        token,
      });
    } else {
      // If OTP does not match
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Resend Account Verification OTP
// ======================================
export const resendOTP = async (req, res) => {
  // Extract identifier (email / username / phone) from request body
  const { identifier } = req.body;

  // -------------------------------------
  // Validate required field
  // -------------------------------------
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: "identifier (email,username,phone) is required ",
    });
  }

  try {
    // -------------------------------------
    // Find user by email, username or phone
    // -------------------------------------
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    }).select("email username phone verification");

    /*
        ---------------------------------
            Check user exists or not
        ---------------------------------
    */
    if (!user)
      return res.status(404).json({ message: "User not found", success: true });

    /*
        ---------------------------------
        If OTP is null → generate new OTP
        ---------------------------------
    */
    if (user.verification.emailOtp === null) {
      const generatedOTP = generateOTP().toString();
      user.verification.emailOtp = bcrypt.hashSync(generatedOTP, 10);

      // Save updated OTP in database
      await user.save();

      // Send OTP email (send actual OTP, not the hash)
      await sendEmail({
        to: user.email,
        subject: "Account Authentication code",
        html: OTPSENDUI(generatedOTP, user.email),
      });

      return res.status(200).json({
        success: true,
        message: "Verification code sent to your register email",
      });
    } else {
      /*
        ---------------------------------
        If OTP already exists → generate new OTP to resend
        ---------------------------------
      */
      const generatedOTP = generateOTP().toString();
      user.verification.emailOtp = bcrypt.hashSync(generatedOTP, 10);

      // Save updated OTP in database
      await user.save();

      // Send OTP email (send actual OTP, not the hash)
      await sendEmail({
        to: user.email,
        subject: "Account Authentication code",
        html: OTPSENDUI(generatedOTP, user.email),
      });

      return res.status(200).json({
        success: true,
        message: "Verification code sent to your register email",
      });
    }
  } catch (error) {
    // -------------------------------------
    // Handle server errors
    // -------------------------------------
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// User Account Login With OTP
// ========================================

export const logInWithOTP = async (req, res) => {
  const { identifier, otp } = req.body;
  const requiredField = { identifier, otp };

  for (let [key, value] of Object.entries(requiredField)) {
    if (!value) {
      return res.status(400).json({
        success: false,
        message: ` ${key} is required`,
      });
    }
  }

  try {
    // check user exist or not
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    }).select("email username phone verification");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });

    // check OTP match or not
    const matchOTP = bcrypt.compareSync(otp, user.verification.emailOtp);

    if (matchOTP) {
      const token = await authTokenGenerate({
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      });
      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();
      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip;
      await new SessionModel({
        userID: user._id,
        refreshToken: token.refreshToken,
        deviceInfo: {
          browser: `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`,
          os: `${ua.os.name || "Unknown"} ${ua.os.version || ""}`,
          deviceType: ua.device.type || "desktop",
          deviceModel: ua.device.model || "Unknown",
          deviceVendor: ua.device.vendor || "Unknown",
        },

        ipAddress: ipAddress,
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        lastActiveAt: new Date(),
      }).save();

      // Send login notification email
      await sendEmail({
        to: user.email,
        subject: "New Login Detected",
        html: LOGIN_NOTIFICATION_EMAIL_UI({
          userName: user.username,
          userEmail: user.email,
          deviceInfo: `${ua.browser.name} on ${ua.os.name}`,
          location: ipAddress,
          time: new Date().toLocaleString(),
          secureAccountLink: `${process.env.FRONTEND_CORS}/account/security`
        }),
      });

      // Clear OTP after successful login
      user.verification.emailOtp = null;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Login Successfully",
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logInWithPassword = async (req, res) => {
  const { identifier, password } = req.body;
  const requiredField = { identifier, password };

  for (let [key, value] of Object.entries(requiredField)) {
    if (!value) {
      return res.status(400).json({
        success: false,
        message: ` ${key} is required`,
      });
    }
  }

  try {
    // check user exist or not
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    }).select("email username phone password role");

    // if user not exist
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });

    // check password match or not
    const matchPassword = bcrypt.compareSync(password, user.password);
    if (matchPassword) {
      // token generate and send response here

      const token = await authTokenGenerate({
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      });

      const parser = new UAParser(req.headers["user-agent"]);
      const ua = parser.getResult();
      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip;
      await new SessionModel({
        userID: user._id,
        refreshToken: token.refreshToken,
        deviceInfo: {
          browser: `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`,
          os: `${ua.os.name || "Unknown"} ${ua.os.version || ""}`,
          deviceType: ua.device.type || "desktop",
          deviceModel: ua.device.model || "Unknown",
          deviceVendor: ua.device.vendor || "Unknown",
        },

        ipAddress: ipAddress,
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        lastActiveAt: new Date(),
      }).save();

      // Send login notification email
      await sendEmail({
        to: user.email,
        subject: "New Login Detected",
        html: LOGIN_NOTIFICATION_EMAIL_UI({
          userName: user.username,
          userEmail: user.email,
          deviceInfo: `${ua.browser.name} on ${ua.os.name}`,
          location: ipAddress,
          time: new Date().toLocaleString(),
          secureAccountLink: `${process.env.FRONTEND_CORS}/account/security`
        }),
      });

      return res
        .status(200)
        .json({ success: true, message: "Login Successfully", token: token });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// edit account details
export const editAccount = async (req, res) => {
  try {
    const {
      username,
      phone,
      avatar,
      bio,
      jobTitle,
      socialMediaName,
      socialMediaUrl,
      emailNotification,
    } = req.body;

    if (!req.user || !req.user.id)
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });

    const user = await UserModel.findById(req.user.id).select(
      "email name phone username role avatar profile preferences",
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    await user.updateOne({
      username: username || user.username,
      phone: phone || user.phone,
      avatar: avatar || user.avatar,
      "profile.bio": bio || user.profile.bio,
      "profile.jobTitle": jobTitle || user.profile.jobTitle,
      "profile.socialLinks": [
        {
          name: socialMediaName,
          url: socialMediaUrl,
        },
      ],
      "preferences.emailNotifications": emailNotification,
    });

    return res.status(200).json({
      message: "Account details updated successfully",
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// refresh token generate and send response here
export const refreshToken = async (req, res) => {

  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: "Refresh Token is required", success: false });
    }
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    const newToken = authTokenGenerate({
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      phone: decoded.phone,
      role: decoded.role,
    });
    return res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token", success: false, error: error.message });
  }
}; 
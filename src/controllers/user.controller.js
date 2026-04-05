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
    if ((value = "" || null)) {
      return res.status(400).json({
        success: false,
        message: ` ${key} is required`,
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

      // Create new user document
      const newUser = await UserModel({
        name,
        email,
        username,
        password: hashPassword,
        phone,

        // Store OTP for account verification
        verification: {
          otp: generateOTP(),
          isVerified: false,
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
      // Send OTP verification email
      // ---------------------------------------
      await sendEmail({
        to: newUser.email,
        subject: "Account Verification code",
        html: OTPSENDUI(newUser.verification.otp, newUser.email),
      });

      // ---------------------------------------
      // Response after sending OTP
      // ---------------------------------------
      return res.status(201).json({
        message: `Verification code sent ${newUser.email}`,
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
    }).select("email username phone verification");

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
        message: "User Already Verified",
      });

    // ---------------------------------------
    // Compare entered OTP with stored OTP
    // ---------------------------------------
    const matchOTP = parseInt(otp) === parseInt(user.verification.otp);

    if (matchOTP) {
      await sendEmail({
        to: user.email,
        subject: "Welcome to KRAVIONA",
        html: WelcomeEmailUI({
          userName: user.username,
        }),
      });
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
    if (user.verification.otp === null) {
      user.verification.otp = generateOTP();

      // Save updated OTP in database
      user.save();

      // Send OTP email
      sendEmail({
        to: user.email,
        subject: "Account Authentication code",
        html: OTPSENDUI(user.verification.otp, user.email),
      });

      return res.status(200).json({
        success: true,
        message: "Verification code sent your register email",
      });
    } else {
      /*
        ---------------------------------
        If OTP already exists → resend same OTP
        ---------------------------------
      */
      sendEmail({
        to: user.email,
        subject: "Account Authentication code",
        html: OTPSENDUI(user.verification.otp, user.email),
      });

      return res.status(200).json({
        success: true,
        message: "Verification code sent your register email",
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
    const matchOTP = parseInt(otp) === parseInt(user.verification.otp);
    if (matchOTP) {
      // token generate and send response here
      console.log("Login Successfully");
      const token = await authTokenGenerate({
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      });

      // Send login notification email

      // Clear OTP after successful login
      user.verification.otp = null;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Login Successfully",
        token: token,
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

  console.log({ requiredField });

  try {
    // check user exist or not
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    }).select("email username phone password role");
    console.log(user);

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
      console.log("Login Successfully");
      const token = await authTokenGenerate({
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      });

      console.log("User", user);

      // Send login notification email

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

//

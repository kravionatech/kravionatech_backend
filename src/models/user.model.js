import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "Enter a valid name (alphabets only)",
      ],
      minlength: [3, "Name should be at least 3 characters"],
      maxlength: [20, "Name should be maximum 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Email ID is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Enter a valid Email ID",
      ],
      minlength: [3, "Email ID should be at least 3 characters"],
      maxlength: [32, "Email ID should be maximum 32 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      minlength: [3, "Username should be at least 3 characters"],
      maxlength: [32, "Username should be maximum 32 characters"],
    },

    phone: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Enter Mobile Number With Country code"],
      minlength: [7, "Phone Number   should be at least 3 characters"],
      maxlength: [14, "Phone Number should be maximum 14 characters"],
    },

    isVerified: {
      type: Boolean,
      default: false,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Username is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verification: {
      otp: { type: Number, default: null },
      isVerified: { type: Boolean, default: false },
    },
    avatar: String,

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "creator"],
    },

    avatar: {
      type: String,
      validate: {
        validator: function (v) {
          // Simple regex for URL validation
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  { timestamps: true },
);

export const UserModel = model("User", userSchema);

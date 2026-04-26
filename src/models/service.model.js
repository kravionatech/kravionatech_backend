import { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
      minlength: [3, "Service name must be at least 3 characters long"],
      maxlength: [50, "Service name must be at most 50 characters long"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],

      expert:{

      },
      layoutType:{
     type:String,
      },
      prices:{

      }

    },
  },
  { timestamps: true },
);

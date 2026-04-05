import { v2 as cloudinary } from "cloudinary";
import { MediaModel } from "../models/media.model.js";
import { UserModel } from "../models/user.model.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
        success: false,
      });
    }
    const user = await UserModel.findById(req.user.id).select(
      "name email phone role",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }

    const file = req?.file;
    const { filename } = req.body;

    if (!file) {
      return res.status(400).json({
        message: "File is required",
        success: false,
      });
    }
    if (file) {
      const fileType = file.mimetype.split("/")[0]; // 'image', 'video', 'application'
      let targetFolder = "others";

      if (fileType === "image") {
        targetFolder = "crossover/images";
      } else if (fileType === "video") {
        targetFolder = "crossover/videos";
      } else if (file.mimetype === "application/pdf") {
        targetFolder = "crossover/docs";
      }
      console.log("Uploading  ...");
      // 2. Cloudinary Upload Function
      const result = await cloudinary.uploader.upload(
        file?.path,
        {
          resource_type: "auto",
          folder: targetFolder,
        },
        (error, result) => {
          if (error) {
            console.log("Cloudinary Error:", error);
          }
        },
      );

      const newFile = await MediaModel({
        url: result.secure_url,
        filename: file.filename,
        alt: filename,
        userID: req.user.id,
        authorDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        format: file.mimetype.split("/")[1],
        size: file.size,
        duration: file.duration,
      }).save();

      console.log("Uploaded");

      //   unlink file
      await fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });

      return res.status(201).json({
        message: "File uploaded successfully",
        success: true,
        data: newFile,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "internal server issue",
      error: error.message,
      success: false,
    });
  }
};

// get aur media admin

export const getAllFiles = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role !== "admin")
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const files = await MediaModel.find({
      userID: user._id,
    })
      .select("url filename authorDetails format size")
      .sort({
        createAt: -1,
      })
      .skip(skip)
      .limit(limit);

    if (files.length === 0) {
      return res.status(404).json({
        message: "Media file not found",
        success: false,
      });
    }

    if (files) {
      return res.status(200).json({
        message: "Media fetch Success fully",
        success: true,
        pagination: {
          total: await MediaModel.countDocuments(),
          page,
          limit,
        },

        files,
      });
    }
  } catch (error) {
    return res.status(500).status({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

// delete files

export const deleteFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role !== "admin")
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });

    const fileID = req.params.id;

    const file = await MediaModel.findById(fileID);

    if (!file) {
      return res.status(404).json({
        message: "Media file not found",
        success: false,
      });
    }

    // delete from cloudinary
    const publicID = file.url.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(publicID, (error, result) => {
      if (error) {
        console.log("Cloudinary Deletion Error:", error);
      }
    });

    await MediaModel.findByIdAndDelete(fileID);

    return res.status(200).json({
      message: "Media file deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

// ==========================================
// 4. UPDATE FILE DETAILS (Alt Text & Filename)
// ==========================================
export const changeAlt = async (req, res) => {
  try {
    // 1. Check authentication
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
        success: false,
      });
    }

    // 2. Verify Admin permissions
    const user = await UserModel.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }

    // 3. Get the File ID and the new data from the request
    const fileID = req.params.id;
    const { altText, filename } = req.body;

    // 4. Find the file in the database
    const file = await MediaModel.findById(fileID);
    if (!file) {
      return res.status(404).json({
        message: "Media file not found",
        success: false,
      });
    }

    // 5. Update the fields (only if they were provided in the request)
    if (altText !== undefined) file.altText = altText;
    if (filename !== undefined) file.filename = filename;

    // Save the updated document
    await file.save();

    return res.status(200).json({
      message: "Media details updated successfully",
      success: true,
      data: file,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

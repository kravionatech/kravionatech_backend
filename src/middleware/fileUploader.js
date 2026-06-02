import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff|psd|ai|eps|raw|heic|mp4|mp3|wav|avi|mkv|webm|flv|mpeg|ogg|opus|pdf|docx|xlsx|pptx|txt/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: This file type is not supported by our system!"));
  }
};

// Multer expects fileSize in bytes (Number), not a string. Cap at 100 MB which
// is the practical limit we'll let through to Cloudinary.
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

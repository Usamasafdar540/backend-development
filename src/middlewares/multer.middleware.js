import path from "path";
import multer from "multer";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// File Filter Function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only JPG, PNG, and JPEG files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Single file upload middleware
const singleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ status: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

// Multiple file upload middleware for the same field
const multipleUpload = (fieldName, maxCount) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ status: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

// New: Fields upload middleware for handling multiple fields at once
const fieldsUpload = (fieldsArray) => (req, res, next) => {
  upload.fields(fieldsArray)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ status: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

export default { singleUpload, multipleUpload, fieldsUpload };

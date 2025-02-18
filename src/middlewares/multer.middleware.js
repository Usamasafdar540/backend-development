import path from "path";
import multer from "multer";
import fs from "fs/promises";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow only specific file types
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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});

// Helper function to delete uploaded files from req.file or req.files
const cleanupFiles = async (req) => {
  // If a single file was uploaded via upload.single()
  if (req.file && req.file.path) {
    try {
      await fs.unlink(req.file.path);
    } catch (err) {
      console.error(`Error deleting file ${req.file.path}:`, err);
    }
  }
  // If multiple files were uploaded via upload.fields() or upload.array()
  if (req.files) {
    const fileKeys = Object.keys(req.files);
    await Promise.all(
      fileKeys.map(async (key) => {
        const filesArray = req.files[key];
        if (Array.isArray(filesArray)) {
          await Promise.all(
            filesArray.map(async (file) => {
              try {
                await fs.unlink(file.path);
              } catch (err) {
                console.error(`Error deleting file ${file.path}:`, err);
              }
            })
          );
        }
      })
    );
  }
};

// Single file upload middleware
const singleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) {
      await cleanupFiles(req);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: false, message: `Multer error: ${err.message}` });
      }
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

// Multiple file upload middleware for the same field
const multipleUpload = (fieldName, maxCount) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, async (err) => {
    if (err) {
      await cleanupFiles(req);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: false, message: `Multer error: ${err.message}` });
      }
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

// Fields upload middleware for handling multiple fields at once
const fieldsUpload = (fieldsArray) => (req, res, next) => {
  upload.fields(fieldsArray)(req, res, async (err) => {
    if (err) {
      await cleanupFiles(req);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: false, message: `Multer error: ${err.message}` });
      }
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

export default { singleUpload, multipleUpload, fieldsUpload };

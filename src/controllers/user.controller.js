import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import sendError from "../utils/sendError.js";
import sendResponse from "../utils/sendResponse.js";
import cloudinaryUploadImg from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { userName, fullName, password, email } = req.body;

  if (!userName || !fullName || !email || !password) {
    return sendError(res, 400, "All fields are required");
  }

  if (
    !req.files ||
    !req.files.avatar ||
    req.files.avatar.length === 0 ||
    !req.files.coverImage ||
    req.files.coverImage.length === 0
  ) {
    return sendError(res, 400, "Both avatar and cover image are required.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, "User already exists");
  }

  let avatarUrl;
  try {
    const { url } = await cloudinaryUploadImg(req.files.avatar[0].path);
    avatarUrl = url;
  } catch (error) {
    return sendError(res, 500, "Failed to upload avatar image.", error);
  }

  let coverImageUrl;
  try {
    const { url } = await cloudinaryUploadImg(req.files.coverImage[0].path);
    coverImageUrl = url;
  } catch (error) {
    return sendError(res, 500, "Failed to upload cover image.", error);
  }

  const newUser = new User({
    userName,
    fullName,
    email,
    password,
    avatar: avatarUrl,
    coverImage: coverImageUrl,
  });

  await newUser.save();

  const accessToken = newUser.generateAccessToken();
  const refreshToken = newUser.generateRefreshToken();

  newUser.refreshToken = refreshToken;
  await newUser.save();

  return sendResponse(res, 201, "User created successfully", {
    data: {
      id: newUser._id,
      userName: newUser.userName,
      fullName: newUser.fullName,
      email: newUser.email,
      avatar: newUser.avatar,
      coverImage: newUser.coverImage,
    },
    accessToken,
    refreshToken,
  });
});

export default { registerUser };

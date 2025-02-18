import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendError from "../utils/sendError.js";
import sendResponse from "../utils/sendResponse.js";
import { cloudinaryUploadImg } from "../utils/cloudinary.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { userName, fullName, password, email } = req.body;

    if (!userName || !fullName || !email || !password) {
      return sendError(res, 400, "All fields are required.");
    }

    if (!req.files?.avatar || !req.files?.coverImage) {
      return sendError(res, 400, "Both avatar and cover image are required.");
    }

    const userExists = await User.exists({ email });
    if (userExists) {
      return sendError(res, 400, "User already exists.");
    }

    const [avatarUpload, coverUpload] = await Promise.all([
      cloudinaryUploadImg(req.files.avatar[0].path),
      cloudinaryUploadImg(req.files.coverImage[0].path),
    ]);

    const user = new User({
      userName,
      fullName,
      email,
      password,
      avatar: avatarUpload.url,
      coverImage: coverUpload.url,
    });

    // const accessToken = generateAccessToken(user);
    // const refreshToken = generateRefreshToken(user);
    // user.refreshToken = refreshToken;
    await user.save();

    // res.cookie("refresh_token", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    // });

    return sendResponse(res, 201, "User created successfully", {
      data: {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
      },
      // accessToken,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return sendError(res, 500, "Internal Server Error. Please try again.");
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;

    if (!userName && !email) {
      return sendError(res, 400, "Please provide an email or username.");
    }
    if (!password) {
      return sendError(res, 400, "Password is required.");
    }

    const user = await User.findOne({ $or: [{ userName }, { email }] });
    if (!user) {
      return sendError(res, 404, "User does not exist.");
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Wrong credentials.");
    }

    const accessToken = generateAccessToken(user);
    // const refreshToken = generateRefreshToken(user);
    // user.refreshToken = refreshToken;
    // await user.save();

    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });
    // res.cookie("refresh_token", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return sendResponse(res, 200, "User logged in successfully", {
      data: {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return sendError(res, 500, "Internal Server Error. Please try again.");
  }
});

// const logoutUser = asyncHandler(async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       refreshToken: req.cookies.refresh_token,
//     });
//     if (user) {
//       user.refreshToken = null;
//       await user.save();
//     }
//     res.clearCookie("auth_token");
//     res.clearCookie("refresh_token");
//     return sendResponse(res, 200, "Logged out successfully.");
//   } catch (error) {
//     console.error("Error in logoutUser:", error);
//     return sendError(res, 500, "Internal Server Error. Please try again.");
//   }
// });

// const refreshAccessToken = asyncHandler(async (req, res, next) => {
//   try {
//     const { refreshToken } = req.cookies;
//     if (!refreshToken) {
//       return sendError(res, 401, "No refresh token provided.");
//     }

//     const user = await User.findOne({ refreshToken: refreshToken });
//     if (!user) {
//       return sendError(res, 403, "Invalid refresh token.");
//     }

//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
//       if (err || user._id.toString() !== decoded.id) {
//         return sendError(res, 403, "Invalid refresh token.");
//       }
//       const newAccessToken = generateAccessToken(user);
//       return sendResponse(res, 200, "Access token refreshed", {
//         accessToken: newAccessToken,
//       });
//     });
//   } catch (error) {
//     console.error("Error in refreshAccessToken:", error);
//     return sendError(res, 500, "Internal Server Error. Please try again.");
//   }
// });

export default {
  registerUser,
  loginUser,
  // logoutUser, refreshAccessToken
};

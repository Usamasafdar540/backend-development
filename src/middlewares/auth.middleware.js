const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // If token is not found in header, check cookies
    if (!token && req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    // If no token is found, deny access
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token is missing",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token has expired",
      });
    }

    // Attach user data to request object
    req.user = decoded;

    // Move to the next middleware
    next();
  } catch (error) {
    console.error("Token validation error:", error.message);

    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
});

//alternate method for role check

// const isAdmin = asyncHandler(async (req, res, next) => {
//   const { email } = req.user;
//   const adminUser = await User.findOne({ email });
//   if (adminUser.roles !== "admin") {
//     res.status(400).json({
//       status: false,
//       message: "User Is Not authorized ",
//     });
//   }
// });
// module.exports = { validateToken, isAdmin };
module.exports = validateToken;

const ErrorHandler = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Simulate user role if provided in headers
    const simulatedUserRole = req.headers["user-role"];
    if (!simulatedUserRole) {
      return next(
        new ErrorHandler(`Role: Role Doesn't Exists Please send the Role`, 403)
      );
    }

    if (simulatedUserRole && !roles.includes(simulatedUserRole)) {
      return next(
        new ErrorHandler(
          `Role: ${simulatedUserRole} is not allowed to access this resource`,
          403
        )
      );
    }

    // If user role is not provided in headers, check req.user.role
    if (!simulatedUserRole && req.user && !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};

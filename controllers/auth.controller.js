import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import mailHelper from "../utils/mailHelper";
import crypto from "crypto";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  //Could be in a separate file in utils
};

/**
 * @SIGNUP
 * @route http://localhost:4000/api/auth/signup
 * @description User signup controller for creating new user
 * @parameters name, email, password
 * @return User Object
 */

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new CustomError("Please fill all fields", 400);
  }
  //check if user exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });
  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**
 * @LOGIN
 * @route http://localhost:4000/api/auth/login
 * @description User login controller for logging in
 * @parameters email, password
 * @return User Object
 */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError("Please fill all fields", 400);
  }
  //chaining on select because we have made select false in userSchema
  //hence overriding select for password
  //reference docs
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError("Invalid Credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (isPasswordMatched) {
    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  }
  throw new CustomError("Invalid Credentials - Pass", 400);
});

/**
 * @LOGOUT
 * @route http://localhost:4000/api/auth/logout
 * @description User logout by clearing user cookies
 * @parameters
 * @return success message
 */

//Good code practice
//why '_req' and not 'req' = to let others know req is not
//used any where
export const logout = asyncHandler(async (_req, res) => {
  //Another way
  //res.clearCookie();

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

/**
 * @FORGOT_PASSWORD
 * @route http://localhost:4000/api/auth/password/forgot
 * @description User will submit email and we will generate token
 * @parameters email
 * @return success message - Email Sent
 */

export const forgotPassword = asyncHandler(async (req, res) => {
  //grab email
  const { email } = req.body;

  //Search user in db
  const user = await User.findOne({ email });
  //TODO: Check email for empty or null values

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const resetToken = user.generateForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `
  ${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}
  `;

  const text = `
  Your password reset Url is \n\n\n ${resetUrl} \n\n\n`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });
    res.status(200).json({
      success: true,
      message: `Reset Email sent to ${user.email}`,
    });
  } catch (error) {
    //Roll back  - clear fields and then save
    user.generateForgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new CustomError(error.message || "Email sent failure", 500);
  }
});

/**
 * @RESET_PASSWORD
 * @route http://localhost:4000/api/auth/password/reset/:resetToken
 * @description User will be able to reset password based on url token
 * @parameters token from url, password, confirm password
 * @return User object
 */

export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //will return data only if both the conditions are true
  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    //greater than date.now
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new CustomError("Password token is invalid or expired", 400);
  }

  if (password !== confirmPassword) {
    throw new CustomError("Password & Confirm password does not match", 400);
  }

  user.password = password;
  forgotPasswordToken = undefined;
  forgotPasswordExpiry = undefined;

  await user.save();

  //Create token and send as reponse : optional
  const token = user.getJwtToken();
  user.password = undefined;

  //TODO: Add helper method for cookie
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
  });
});

//TODO:create a controller for change password

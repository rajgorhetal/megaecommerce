import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import config from "../config/index";

import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLenght: [50, "Name must be less than 50"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      //TODO: add email validation using regex https://regexr.com/
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be atleast 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: AuthRoles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

//TODO: Encrypt the password
userSchema.pre("save", async function (next) {
  //Check if its saving only for this first time
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Add more features directly to schema
userSchema.methods = {
  //Compare password
  comparePassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  //generate JWT Token
  getJwtToken: function () {
    return Jwt.sign(
      {
        _id: this._id,
        role: this.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRY,
      }
    );
  },
  //generate
  generateForgotPasswordToken: function () {
    const forgotToken = crypto.randomBytes(64).toString("hex");

    //step1: Save to DB
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 20 + 60 * 1000;
    //step2: return values to user
    return forgotToken;
  },
};

export default mongoose.model("User", userSchema);

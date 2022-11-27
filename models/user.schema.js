import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";

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
  if (!this.modified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);

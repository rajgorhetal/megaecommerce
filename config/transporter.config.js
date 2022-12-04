import nodemailer from "nodemailer";
import config from "./index";

let transporter = nodemailer.createTransport({
  host: config.SMPT_MAIL_HOST,
  port: config.SMPT_MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.SMPT_MAIL_USERNAME, // generated ethereal user
    pass: config.SMPT_MAIL_PASSWORD, // generated ethereal password
  },
});

export default transporter;
//mailnator, mailhog

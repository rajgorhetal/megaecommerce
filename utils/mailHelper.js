import transporter from "../config/transporter.config.js";
import config from "../config/index.js";

const mailHelper = async (options) => {
  const message = {
    from: config.SMPT_MAIL_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  await transporter.sendMail(message);
};

export default mailHelper;

const sgMail = require("@sendgrid/mail");

const dotenv = require("dotenv");

dotenv.config({ path: "../config.env" });

sgMail.setApiKey(process.env.SG_KEY);

const sendSGMail = async ({
  recipient,
  sender,
  subject,
  html,
  text,
  attachments,
}) => {
  try {
    const from = sender || "tung_2151220220@dau.edu.vn";

    const msg = {
      to: recipient,
      from: from,
      subject,
      html: html,
      text: text,
      attachments,
    };

    console.log("Sending email with the following details:", msg); // 🟢 Log nội dung email

    const response = await sgMail.send(msg);
    console.log("Email sent successfully:", response); // 🟢 Log nếu email được gửi thành công

    return response;
  } catch (error) {
    console.error("Error sending email:", error.response?.body || error); // 🟢 Log lỗi nếu gửi email thất bại
    throw error;
  }
};

exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return new Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};

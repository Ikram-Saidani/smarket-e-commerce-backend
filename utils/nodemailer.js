const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main(userEmail,link) {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:8000";
    const validationLink = `${baseUrl}/api/auth/validateUser/${link}`;

  const info = await transporter.sendMail({
    from: '"amazon" <amazon@amazon.com>',
    to: userEmail,
    subject: "Account Validation",
    text: "Please validate your account.",
    html: `<h1><a href="${validationLink}">Validate your account</a></h1>`,
  });

  console.log("Message sent: %s", info.messageId);
  return info.messageId;
} catch (error) {
  console.error("Failed to send email:", error.message);
  throw new Error("Email sending failed. Please try again later.");
}
}

module.exports=main
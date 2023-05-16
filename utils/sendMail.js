import { createTransport } from "nodemailer";

export const sendMail = async (userEmail, subject, text) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

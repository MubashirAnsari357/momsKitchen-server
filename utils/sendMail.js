import { createTransport } from "nodemailer";


export const sendMail = async (userEmail, subject, text)=>{
    
    var transport = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });

    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject,
        text,
    })
}
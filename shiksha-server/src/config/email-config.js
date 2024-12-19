import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const USER = process.env.EMAIL_USER;
const PASSWORD = process.env.EMAIL_PASS;

let transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: USER, // Admin Gmail ID
    pass: PASSWORD, // Admin Gmail Password
  },
});

export { transporter, HOST, PORT, USER, PASSWORD };

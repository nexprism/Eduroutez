import transporter from "../config/emailConfig.js";
import EmailVerificationModel from "../models/EmailVerification.js";
const sendEmailVerificationOTP = async (req, user) => {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Clear existing OTPs for this user before saving a new one
  await EmailVerificationModel.deleteMany({ userId: user._id });

  // Save OTP in Database
  await new EmailVerificationModel({ userId: user._id, otp: otp.toString() }).save();

  //  OTP Verification Link
  const otpVerificationLink = `${process.env.FRONTEND_HOST}/account/verify-email`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    html: `<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP): ${otpVerificationLink} </p>
    <h2 style="color: #b82025; font-size: 24px; letter-spacing: 5px;">OTP: ${otp}</h2>
    <p>This OTP is valid for 90 seconds. If you didn't request this OTP, please ignore this email.</p>`,
  });

  return otp;
};

export { sendEmailVerificationOTP };

import { EmailConfig } from "../../config/index.js";

function sendEmail(to, subject, message) {
  EmailConfig.transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: message,
  });
}
export { sendEmail };
// `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">click here</a> to reset your password.</p>`

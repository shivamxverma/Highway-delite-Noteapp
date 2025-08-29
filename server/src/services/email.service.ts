import { transporter } from "../configs/email.config.js";
import { Verification_Email_Template } from "../utils/VerificationEmailTemplate.js";

export const sendVerificationEmail = async (to: string, code: string) => {
  console.log(to, code);
  const mailOptions = {
    from: process.env.EMAIL || "default@email.com",
    to,
    subject: "Verify Your Email",
    html: Verification_Email_Template(code),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error("Could not send verification email");
  }
};


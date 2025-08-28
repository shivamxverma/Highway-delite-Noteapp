import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();

const sesClient = new SESClient({
    region : process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const sendOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  const params = {
    Destination: { ToAddresses: ["sv0087218@gmail.com"] },
    Message: {
      Body: { Text: { Data: `Your OTP is ${otp}` } },
      Subject: { Data: "Your OTP Code" },
    },
    Source: "shivam0xverma@gmail.com",
  };

  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);
  console.log("Email sent! Message ID:", response.MessageId);
};

sendOtp().catch((error) => {
  console.error("Error sending email:", error);
});

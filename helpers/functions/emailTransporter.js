import nodemailer from "nodemailer";

// Create a transporter with your email service provider's SMTP settings
const transportConfig = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "imemario77@gmail.com",
    pass: "bdmgvpuyymaoujsi",
  },
});

export const transporter = async (
  recipient,
  recipientName,
  otpCode,
  businessName,
  subject
) => {
  try {
    const info = await transportConfig.sendMail({
      from: businessName,
      to: recipient,
      subject: subject,
      html: `
      <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
            body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            }

            .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            header {
            background-color: #007bff;
            color: #fff;
            text-align: center;
            padding: 10px 0;
            }

            header h1 {
            margin: 0;
            }

            footer {
            margin-top: 20px;
            text-align: center;
            color: #777;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <header>
            <h1>${businessName}</h1>
            </header>
            <section>
            <p>Dear ${recipientName},</p>
            <p>
                This is your otp to reset your password
            </p>
            <p>
            ${otpCode}
            </p>
            <p>
                Sincerely,<br>
                Your Name
            </p>
            </section>
            <footer>
            &copy; 2023 Your ${businessName}. All rights reserved.
            </footer>
        </div>
        </body>
        </html>
`,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

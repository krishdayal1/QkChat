import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  const otpMatch = text.match(/\b\d{6}\b/);
  const otp = otpMatch ? otpMatch[0] : null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      ">

        <div style="
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        ">

          <div style="
            background-color: #ffffff;
            border-radius: 14px;
            padding: 40px 35px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          ">

            <div style="
              text-align: center;
              margin-bottom: 30px;
            ">
              <h1 style="
                margin: 0;
                font-size: 28px;
                color: #111827;
              ">
                QkChat
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #6b7280;
                font-size: 14px;
              ">
                Connect. Chat. Stay connected.
              </p>
            </div>

            <h2 style="
              margin: 0 0 15px;
              font-size: 22px;
              color: #111827;
            ">
              ${subject}
            </h2>

            <p style="
              font-size: 16px;
              line-height: 1.6;
              color: #374151;
            ">
              Hello,
            </p>

            <p style="
              font-size: 16px;
              line-height: 1.6;
              color: #374151;
            ">
              ${
                subject.toLowerCase().includes("password")
                  ? "We received a request to reset your QkChat password."
                  : "Welcome to QkChat! Please use the verification code below to continue."
              }
            </p>

            ${
              otp
                ? `
                  <div style="
                    text-align: center;
                    margin: 30px 0;
                  ">

                    <p style="
                      margin-bottom: 10px;
                      font-size: 14px;
                      color: #6b7280;
                    ">
                      Your verification code
                    </p>

                    <div style="
                      display: inline-block;
                      padding: 15px 30px;
                      background-color: #f0f4ff;
                      border-radius: 10px;
                      font-size: 32px;
                      font-weight: bold;
                      letter-spacing: 8px;
                      color: #4f46e5;
                    ">
                      ${otp}
                    </div>

                    <p style="
                      margin-top: 12px;
                      font-size: 13px;
                      color: #6b7280;
                    ">
                      This code will expire in 5 minutes.
                    </p>

                  </div>
                `
                : ""
            }

            <div style="
              margin-top: 25px;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            ">
              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.5;
                color: #6b7280;
              ">
                If you did not request this email, you can safely ignore it.
                Your account remains secure.
              </p>
            </div>

            <p style="
              margin-top: 30px;
              font-size: 15px;
              line-height: 1.6;
              color: #374151;
            ">
              Regards,<br />
              <strong>QkChat Support</strong>
            </p>

            <hr style="
              margin: 30px 0 20px;
              border: none;
              border-top: 1px solid #e5e7eb;
            " />

            <p style="
              margin: 0;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            ">
              This is an automated email from QkChat. Please do not reply.
            </p>

          </div>

        </div>

      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"QkChat Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
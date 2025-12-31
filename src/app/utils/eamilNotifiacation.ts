import { sendEmail } from "./mailSender";

interface BookingNotificationEmailParams {
  sentTo: string;       // user email
  subject: string;      // email subject
  userName: string;     // sender name (service provider)
  messageText: string;  // main text
}

interface OtpSendEmailParams {
  sentTo: string;
  subject: string;
  name: string;
  otp: string | number;
  expiredAt: string;
}


interface WelcomeEmailParams {
  sentTo: string;
  subject: string;
  name: string;
  role: 'employer' | 'candidate';
}

const otpSendEmail = async ({
  sentTo,
  subject,
  name,
  otp,
  expiredAt,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`,
  );
};

 const sendBookingNotificationEmail = async ({
  sentTo,
  subject,
  userName,
  messageText,
}: BookingNotificationEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello ${userName},</h1>
       <p style="font-size: 16px;">${messageText}</p>
       <p style="font-size: 14px; color: #666;">Thank you for using our platform!</p>
    </div>`
  );
};

const sendWelcomeEmail = async ({
  sentTo,
  subject,
  name,
  role,
}: WelcomeEmailParams): Promise<void> => {
  const roleMessage =
    role === 'candidate'
      ? `
        <p style="font-size: 15px;">
          You can now browse job listings and apply for positions that match your skills and experience.
        </p>
        <p style="font-size: 15px;">
          After you apply, your profile and CV are reviewed using our
          <strong>AI-assisted screening</strong> along with manual verification by our admin team.
        </p>
        <p style="font-size: 15px;">
          This helps ensure your application reaches employers where you are the best fit.
        </p>
      `
      : `
        <p style="font-size: 15px;">
          You can now create job posts and attract qualified candidates.
        </p>
        <p style="font-size: 15px;">
          Each application is reviewed using our
          <strong>AI-assisted candidate analysis</strong> to identify the most relevant applicants for your job.
        </p>
        <p style="font-size: 15px;">
          Our admin team then forwards the <strong>best-matched CVs</strong> to employers with an active
          subscription (<strong>Bronze, Platinum, or Diamond</strong>).
        </p>
      `;

  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Welcome to StaffSecure 🎉</h1>

      <p style="font-size: 16px;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="font-size: 16px;">
        Your <strong>${role}</strong> account has been successfully created.
      </p>

      <div style="background-color: #f2f2f2; padding: 16px; border-radius: 6px; margin: 20px 0;">
        ${roleMessage}
      </div>

      <p style="font-size: 14px; color: #666;">
        We combine technology and human review to make hiring smarter, faster, and fair.
      </p>

      <p style="font-size: 14px;">
        Best regards,<br />
        <strong>StaffSecure Team</strong>
      </p>
    </div>`
  );
};



export { otpSendEmail, sendBookingNotificationEmail, sendWelcomeEmail };

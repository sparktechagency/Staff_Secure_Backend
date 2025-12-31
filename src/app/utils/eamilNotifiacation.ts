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
  role: 'employer' | 'Candidate';
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
  const emailBody =
    role === 'employer'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Staff Secure</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Welcome to Staff Secure.<br />
            Your employer account has been successfully created.
          </p>

          <p>
            You can now access your dashboard to manage vacancies, review candidates,
            and oversee your recruitment activity.
          </p>

          <p>
            To get started, please sign in to your dashboard and choose the right
            package for your business to begin posting vacancies.
          </p>

          <p>
            If you need any assistance, our team is available via
            <strong>Live Chat</strong> inside your dashboard.
          </p>

          <p>
            Kind regards,<br />
            <strong>Staff Secure Team</strong><br />
            Staff Secure Ltd
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Staff Secure candidate profile is ready</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Welcome to Staff Secure.<br />
            Your candidate profile has been successfully created.
          </p>

          <p>You can now:</p>
          <ul>
            <li>Browse current vacancies</li>
            <li>Apply for roles that match your skills</li>
            <li>Upload your CV and supporting documents</li>
            <li>Track your applications from your dashboard</li>
          </ul>

          <p>
            To improve your chances of being selected, we recommend completing your
            profile and uploading any relevant certifications or documents.
          </p>

          <p>
            If you need help at any time, our support team is available via
            <strong>Live Chat</strong>.
          </p>

          <p>
            Kind regards,<br />
            <strong>Staff Secure Team</strong><br />
            Staff Secure Ltd
          </p>
        </div>
      `;

  await sendEmail(sentTo, subject, emailBody);
};



export { otpSendEmail, sendBookingNotificationEmail, sendWelcomeEmail };

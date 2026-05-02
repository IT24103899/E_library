const nodemailer = require('nodemailer');

/**
 * Professional Email Utility for E-Library
 * Supports: Welcome Emails, Password Reset Tokens
 */
const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS is missing in environment variables!');
    throw new Error('Email configuration missing');
  }

  // 1) Create a transporter
  const transporterConfig = process.env.EMAIL_SERVICE === 'gmail' 
    ? {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 465,
        secure: process.env.EMAIL_SECURE === 'false' ? false : true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('✅ SMTP Transporter Verified');
  } catch (err) {
    console.error('❌ SMTP Verification Failed:', err.message);
    throw new Error(`Email verification failed: ${err.message}`);
  }

  // 2) Define the email options
  const mailOptions = {
    from: `"E-Library Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.text || 'Verification Code',
    html: options.html,
  };

  // 3) Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ SendMail Error:', err.message);
    throw err;
  }
};

module.exports = sendEmail;


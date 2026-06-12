const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer.
 * Falls back to logging to console if SMTP environment variables are missing.
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 */
const sendEmail = async (options) => {
  const isSmtpConfigured = 
    process.env.EMAIL_HOST && 
    process.env.EMAIL_PORT && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_PASS;

  if (!isSmtpConfigured) {
    console.log('\n================================================================');
    console.log('⚠️  EMAIL SMTP NOT FULLY CONFIGURED IN .ENV');
    console.log('----------------------------------------------------------------');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (HTML Snippet):\n${options.html.replace(/<[^>]*>/g, ' ').substring(0, 300)}...`);
    
    // Extract verify link from HTML to print it explicitly for testing
    const linkMatch = options.html.match(/href="([^"]+)"/);
    if (linkMatch && linkMatch[1]) {
      console.log('\n🔗 VERIFICATION LINK:');
      console.log(`👉 ${linkMatch[1]}`);
    }
    console.log('================================================================\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Shramik Connect" <onboarding@shramik.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.html.replace(/<[^>]*>/g, ''), // Fallback plain text
  };

  // Send the actual email
  await transporter.sendMail(mailOptions);
};

/**
 * Generates the HTML template for email verification.
 * 
 * @param {string} name - User's name
 * @param {string} verifyUrl - Email verification URL
 * @returns {string} - Styled HTML template
 */
const getVerificationEmailTemplate = (name, verifyUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #eef2f5;
      }
      .header {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 40px 30px;
        color: #334155;
        line-height: 1.6;
      }
      .content h2 {
        color: #1e293b;
        font-size: 20px;
        margin-top: 0;
        margin-bottom: 15px;
      }
      .content p {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 15px;
      }
      .btn-container {
        text-align: center;
        margin: 35px 0;
      }
      .btn {
        background-color: #f97316;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 30px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        display: inline-block;
        box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);
        transition: background-color 0.2s ease, transform 0.2s ease;
      }
      .btn:hover {
        background-color: #ea580c;
        transform: translateY(-1px);
      }
      .footer {
        background-color: #f8fafc;
        padding: 25px 30px;
        text-align: center;
        font-size: 13px;
        color: #64748b;
        border-top: 1px solid #eef2f5;
      }
      .footer a {
        color: #f97316;
        text-decoration: none;
      }
      .link-fallback {
        word-break: break-all;
        background-color: #f1f5f9;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        color: #475569;
        margin-top: 25px;
        border: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Shramik Connect</h1>
      </div>
      <div class="content">
        <h2>Verify your email address</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up on Shramik Connect! To activate your account and access our workspace booking, worker listings, and services, please verify your email by clicking the button below.</p>
        <div class="btn-container">
          <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
        </div>
        <p>This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
        <div class="link-fallback">
          <strong>If the button doesn't work, copy and paste this URL into your browser:</strong><br>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2026 Shramik Connect. All rights reserved.</p>
        <p>If you have any questions, contact our support team.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  sendEmail,
  getVerificationEmailTemplate,
};

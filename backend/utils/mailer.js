const sendPasswordResetEmail = async (toEmail, newPassword) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[DEV MODE] Password reset for ${toEmail}: ${newPassword}`);
    return { devMode: true, success: true };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InternConnect" <${smtpUser}>`,
      to: toEmail,
      subject: 'Your Password Has Been Reset - InternConnect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>InternConnect Password Reset</h2>
          <p>A new password has been generated for your account.</p>
          <p>Your new temporary password is: <strong style="font-size: 16px; color: #0284c7;">${newPassword}</strong></p>
          <p>Please log in with this new password.</p>
        </div>
      `
    });

    console.log(`Password reset email successfully sent to ${toEmail}`);
    return { devMode: false, success: true };
  } catch (error) {
    console.error('SMTP Mailer Error, falling back to log:', error.message);
    console.log(`[DEV MODE] Password reset for ${toEmail}: ${newPassword}`);
    return { devMode: true, success: true };
  }
};

const sendInvoiceEmail = async (toEmail, invoiceDetails, name) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const subject = `Payment Receipt: ${invoiceDetails.planName} Plan - InternConnect`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0284c7; margin-top: 0;">InternConnect Payment Receipt</h2>
      <p style="font-size: 14px;">Hi <strong>${name || 'Student'}</strong>,</p>
      <p style="font-size: 14px;">Thank you for upgrading your subscription on InternConnect!</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Plan Name:</strong></td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">${invoiceDetails.planName} Plan</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Amount Paid:</strong></td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #16a34a; font-size: 15px;">${invoiceDetails.amountPaid}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Payment ID:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #334155;">${invoiceDetails.paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Order ID:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #334155;">${invoiceDetails.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Date:</strong></td>
            <td style="padding: 6px 0; text-align: right; color: #334155;">${invoiceDetails.date}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        Need help? Reply directly to this email or visit your InternConnect Student Dashboard.
      </p>
    </div>
  `;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[DEV MODE] Invoice email for ${toEmail}:`, invoiceDetails);
    return { devMode: true, success: true };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InternConnect" <${smtpUser}>`,
      to: toEmail,
      subject,
      html: htmlContent
    });

    console.log(`Invoice email successfully sent to ${toEmail}`);
    return { devMode: false, success: true };
  } catch (error) {
    console.error('SMTP Mailer Error sending invoice, falling back to log:', error.message);
    console.log(`[DEV MODE] Invoice email for ${toEmail}:`, invoiceDetails);
    return { devMode: true, success: true };
  }
};

const sendOtpEmail = async (toEmail, otp, purpose) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const purposeLabels = {
    resume_payment: 'Resume Builder Payment Verification',
    language_change_fr: 'French Language Activation',
    login_chrome: 'Chrome Browser Login Verification',
    register_recruiter: 'Recruiter Account Registration',
    register_student: 'Student Account Registration'
  };
  const purposeLabel = purposeLabels[purpose] || 'Verification';

  const subject = `Your OTP for ${purposeLabel} - InternConnect`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0284c7; margin-top: 0;">InternConnect OTP Verification</h2>
      <p style="font-size: 14px;">Your one-time password for <strong>${purposeLabel}</strong>:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a; background: #f0f9ff; padding: 12px 24px; border-radius: 12px; border: 2px solid #0284c7;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #64748b;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
  `;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[DEV MODE] OTP for ${toEmail} (${purpose}): ${otp}`);
    return { devMode: true, success: true };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InternConnect" <${smtpUser}>`,
      to: toEmail,
      subject,
      html: htmlContent
    });

    console.log(`OTP email successfully sent to ${toEmail} for ${purpose}`);
    return { devMode: false, success: true };
  } catch (error) {
    console.error('SMTP Mailer Error sending OTP, falling back to log:', error.message);
    console.log(`[DEV MODE] OTP for ${toEmail} (${purpose}): ${otp}`);
    return { devMode: true, success: true };
  }
};

module.exports = { sendPasswordResetEmail, sendInvoiceEmail, sendOtpEmail };

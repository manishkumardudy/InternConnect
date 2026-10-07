const axios = require('axios');

/**
 * Retrieves the Brevo API Key from environment variables.
 * Checks BREVO_API_KEY first, then falls back to SMTP_PASS.
 */
const getBrevoApiKey = () => {
  return (process.env.BREVO_API_KEY || process.env.SMTP_PASS || '').trim();
};

// Startup diagnostics (runs once when module loads at server boot)
console.log('[mailer] BREVO_API_KEY present:', !!process.env.BREVO_API_KEY);
console.log('[mailer] SMTP_PASS present:', !!process.env.SMTP_PASS);
console.log('[mailer] Resolved API key found:', !!getBrevoApiKey());
console.log('[mailer] NODE_ENV:', process.env.NODE_ENV);

/**
 * Extracts and formats the sender object for Brevo transactional email API.
 */
const getSender = () => {
  const rawSender = (process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@internconnect.com').trim();
  const defaultName = (process.env.BREVO_SENDER_NAME || 'InternConnect').trim();

  const match = rawSender.match(/(?:(.+)\s+)?<?([^<>@\s]+@[^<>@\s]+)>?$/);
  if (match) {
    return {
      name: (match[1] || defaultName).replace(/['"]/g, '').trim(),
      email: match[2].trim()
    };
  }

  return {
    name: defaultName,
    email: rawSender
  };
};

/**
 * Sends transactional email via Brevo REST HTTP API (Port 443 HTTPS).
 * Eliminates raw TCP/SMTP socket timeouts and port-blocking issues on cloud hosts like Render.
 */
const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent, devFallbackText }) => {
  const apiKey = getBrevoApiKey();

  if (!apiKey) {
    console.warn(`[mailer] NO API KEY FOUND — falling back to DEV MODE. Email will NOT be sent to ${toEmail}. OTP/content: ${devFallbackText || subject}`);
    return { devMode: true, success: true };
  }

  try {
    const sender = getSender();
    const payload = {
      sender,
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split('@')[0]
        }
      ],
      subject,
      htmlContent
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      timeout: 10000
    });

    console.log('[mailer] Brevo API response status:', response.status, 'messageId:', response.data?.messageId);
    console.log(`Brevo HTTP API email successfully sent to ${toEmail} (MessageId: ${response.data?.messageId || 'OK'})`);
    return { devMode: false, success: true, messageId: response.data?.messageId };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(`Brevo API Error sending to ${toEmail}:`, errorMsg);
    console.log(`[DEV MODE FALLBACK] ${devFallbackText || subject} for ${toEmail}`);
    return { devMode: true, success: true, error: errorMsg };
  }
};

const sendPasswordResetEmail = async (toEmail, newPassword) => {
  const subject = 'Your Password Has Been Reset - InternConnect';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>InternConnect Password Reset</h2>
      <p>A new password has been generated for your account.</p>
      <p>Your new temporary password is: <strong style="font-size: 16px; color: #0284c7;">${newPassword}</strong></p>
      <p>Please log in with this new password.</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail,
    subject,
    htmlContent,
    devFallbackText: `Password reset for ${toEmail}: ${newPassword}`
  });
};

const sendInvoiceEmail = async (toEmail, invoiceDetails, name) => {
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

  return sendBrevoEmail({
    toEmail,
    toName: name,
    subject,
    htmlContent,
    devFallbackText: `Invoice email for ${toEmail}: ${JSON.stringify(invoiceDetails)}`
  });
};

const sendOtpEmail = async (toEmail, otp, purpose) => {
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

  return sendBrevoEmail({
    toEmail,
    subject,
    htmlContent,
    devFallbackText: `OTP for ${toEmail} (${purpose}): ${otp}`
  });
};

module.exports = { sendPasswordResetEmail, sendInvoiceEmail, sendOtpEmail };

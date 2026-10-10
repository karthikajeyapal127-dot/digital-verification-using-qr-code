import nodemailer from 'nodemailer';

// Configuration from environment variables (Section 36 & 43)
const emailHost = process.env.EMAIL_HOST || 'smtp.ethereal.email';
const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 587;
const emailUser = process.env.EMAIL_USER || '';
const emailPassword = process.env.EMAIL_PASSWORD || '';
const emailFrom = process.env.EMAIL_FROM || '"VeriGlass Security" <no-reply@veriglass.edu>';

let transporter = null;

// Initialize Transporter with resilient fallback
export async function getTransporter() {
  if (transporter) return transporter;

  if (emailUser && emailPassword) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Generate automatic Ethereal test account if no credentials are provided
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[EmailService] Initialized Ethereal test mailbox: ${testAccount.user}`);
    } catch (e) {
      // JSON log fallback transport if network fails
      transporter = {
        sendMail: async (opts) => {
          console.log(`[EmailService - Offline Fallback] Mail to ${opts.to} | Subject: ${opts.subject}`);
          return { messageId: `offline-${Date.now()}` };
        }
      };
    }
  }

  return transporter;
}

// 1. VALID Verification -> Notify Credential Holder (Section 22)
export async function sendVerificationSuccessEmail({
  to,
  holderName,
  credentialTitle,
  credentialNumber,
  organization,
  verificationId,
  verificationTime = new Date()
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to,
      subject: 'Digital Credential Successfully Verified',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #10b981;">✓ Digital Credential Successfully Verified</h2>
          <p>Dear <strong>${holderName || 'Holder'}</strong>,</p>
          <p>Your official digital credential was just verified through the secure verification network.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Credential:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${credentialTitle}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Credential ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${credentialNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Issuing Organization:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${organization}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Verification Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${verificationId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Timestamp:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date(verificationTime).toLocaleString()}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 0.875rem;">If this verification was not authorized or expected, please contact your organization administrator immediately.</p>
        </div>
      `
    });
    console.log(`[EmailService] Verification success email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending success email: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 2. EXPIRED Credential Alert -> Notify Holder & Admin (Section 22)
export async function sendExpiredCredentialEmail({
  to,
  holderName,
  credentialTitle,
  credentialNumber,
  organization,
  expiryDate
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to,
      subject: 'Expired Credential Verification Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #f59e0b;">⚠ Expired Credential Verification Alert</h2>
          <p>An attempt was made to verify an <strong>EXPIRED</strong> credential for <strong>${holderName || 'Holder'}</strong>.</p>
          <p><strong>Credential:</strong> ${credentialTitle} (${credentialNumber})</p>
          <p><strong>Expiration Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
          <p><strong>Organization:</strong> ${organization}</p>
          <p>The verification request was formally rejected due to expired validity.</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending expired email: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 3. REVOKED Credential Alert -> Notify Holder & Admin (Section 22)
export async function sendRevokedCredentialEmail({
  to,
  holderName,
  credentialTitle,
  credentialNumber,
  organization,
  reason
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to,
      subject: 'Revoked Credential Verification Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #ef4444;">🚫 Revoked Credential Verification Alert</h2>
          <p>A verification attempt was intercepted on a <strong>REVOKED</strong> digital credential.</p>
          <p><strong>Credential:</strong> ${credentialTitle} (${credentialNumber})</p>
          <p><strong>Holder:</strong> ${holderName || 'N/A'}</p>
          <p><strong>Revocation Reason:</strong> ${reason || 'Revoked by authority'}</p>
          <p><strong>Organization:</strong> ${organization}</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending revoked email: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 4. INVALID / Counterfeit Scan Alert -> Notify Admin (Section 22)
export async function sendInvalidCredentialAlert({
  adminEmail,
  scannedKey,
  ipAddress = '127.0.0.1',
  attemptTime = new Date()
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to: adminEmail,
      subject: 'Invalid Credential Verification Attempt',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #dc2626;">❌ Invalid Credential Verification Attempt</h2>
          <p>A verification request was made with an unregistered or counterfeit identifier.</p>
          <p><strong>Scanned Token / Key:</strong> ${scannedKey}</p>
          <p><strong>Origin IP:</strong> ${ipAddress}</p>
          <p><strong>Timestamp:</strong> ${new Date(attemptTime).toLocaleString()}</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending invalid alert: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 5. TAMPERED Credential Alert -> Notify Admin (Section 20 & 25)
export async function sendTamperedCredentialAlert({
  adminEmail,
  credentialNumber,
  credentialTitle,
  ipAddress = '127.0.0.1'
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to: adminEmail,
      subject: 'CRITICAL: Tampered Credential Detected',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #991b1b;">🛑 Cryptographic Tamper Detected</h2>
          <p>A verification attempt failed due to a SHA-256 integrity hash mismatch.</p>
          <p><strong>Credential:</strong> ${credentialTitle} (${credentialNumber})</p>
          <p><strong>Client IP:</strong> ${ipAddress}</p>
          <p>A high-severity security alert has been registered in the database audit log.</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending tamper email: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 6. Credential Expiry Reminder (Section 24 & 25)
export async function sendCredentialExpiryReminder({
  to,
  holderName,
  credentialTitle,
  credentialNumber,
  daysRemaining,
  expiryDate
}) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: emailFrom,
      to,
      subject: `Credential Expiry Reminder: ${daysRemaining} Day(s) Remaining`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #d97706;">⏰ Credential Expiring Soon</h2>
          <p>Dear <strong>${holderName || 'Holder'}</strong>,</p>
          <p>Your credential <strong>${credentialTitle}</strong> (${credentialNumber}) will expire in <strong>${daysRemaining} day(s)</strong> on ${new Date(expiryDate).toLocaleDateString()}.</p>
          <p>Please contact your institution administrator to renew your credential.</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending reminder email: ${err.message}`);
    return { success: false, error: err.message };
  }
}
export async function sendSupportFeedbackEmail({ name, email, message }) {
  try {
    const mailer = await getTransporter();
    const adminEmail = process.env.SUPPORT_EMAIL || 'support@veriglass.io';
    const info = await mailer.sendMail({
      from: emailFrom,
      to: adminEmail,
      subject: `User Feedback from ${name || email}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;color:#1e293b;">
          <h2 style="color:#2563eb;">User Feedback / Support Request</h2>
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `
    });
    console.log(`[EmailService] Support feedback sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[EmailService] Error sending support feedback: ${err.message}`);
    return { success: false, error: err.message };
  }
}

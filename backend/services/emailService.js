const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send expiry reminder email to a member
 */
async function sendExpiryReminder(member, daysLeft) {
  if (!member.email) return;
  const subject =
    daysLeft <= 0
      ? `[Combat Fitness] Your membership has expired`
      : `[Combat Fitness] Your membership expires in ${daysLeft} day(s)`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#f4f4f5;border-radius:12px;overflow:hidden;">
      <div style="background:#e11d48;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;">⚡ Combat Fitness</h1>
        <p style="margin:4px 0 0;color:#fecdd3;font-size:13px;">Train Hard. Manage Smarter.</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;">Hi <strong>${member.name}</strong>,</p>
        ${
          daysLeft <= 0
            ? `<p style="color:#f87171;">Your membership has <strong>expired</strong>. Please visit Combat Fitness to renew and continue your training journey.</p>`
            : `<p>Your membership is expiring in <strong style="color:#e11d48;">${daysLeft} day(s)</strong>. Don't let your streak end — renew now!</p>`
        }
        <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:#a1a1aa;">Member ID</p>
          <p style="margin:0;font-size:18px;font-weight:bold;color:#e11d48;">${member.memberId}</p>
        </div>
        <p style="color:#71717a;font-size:13px;">Contact us at Combat Fitness to renew your membership.</p>
      </div>
      <div style="background:#18181b;padding:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#52525b;">© 2026 Combat Fitness. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Combat Fitness" <${process.env.EMAIL_USER}>`,
    to:      member.email,
    subject,
    html,
  });
}

/**
 * Send payment receipt to a member
 */
async function sendPaymentReceipt(member, payment, plan) {
  if (!member.email) return;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#f4f4f5;border-radius:12px;overflow:hidden;">
      <div style="background:#e11d48;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;">✅ Payment Receipt</h1>
        <p style="margin:4px 0 0;color:#fecdd3;font-size:13px;">Combat Fitness</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;">Hi <strong>${member.name}</strong>,</p>
        <p>Your payment has been received successfully. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr style="background:#18181b;"><td style="padding:10px;border:1px solid #27272a;color:#71717a;">Payment ID</td><td style="padding:10px;border:1px solid #27272a;font-weight:bold;">${payment.paymentId}</td></tr>
          <tr><td style="padding:10px;border:1px solid #27272a;color:#71717a;">Plan</td><td style="padding:10px;border:1px solid #27272a;">${plan?.name || '—'}</td></tr>
          <tr style="background:#18181b;"><td style="padding:10px;border:1px solid #27272a;color:#71717a;">Amount</td><td style="padding:10px;border:1px solid #27272a;color:#4ade80;font-weight:bold;">LKR ${payment.finalAmount?.toLocaleString()}</td></tr>
          <tr><td style="padding:10px;border:1px solid #27272a;color:#71717a;">Method</td><td style="padding:10px;border:1px solid #27272a;text-transform:capitalize;">${payment.method}</td></tr>
          <tr style="background:#18181b;"><td style="padding:10px;border:1px solid #27272a;color:#71717a;">Valid Until</td><td style="padding:10px;border:1px solid #27272a;color:#e11d48;font-weight:bold;">${new Date(payment.validTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
        </table>
        <p style="color:#71717a;font-size:13px;">Thank you for choosing Combat Fitness!</p>
      </div>
      <div style="background:#18181b;padding:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#52525b;">© 2026 Combat Fitness. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Combat Fitness" <${process.env.EMAIL_USER}>`,
    to:      member.email,
    subject: `Payment Receipt — ${payment.paymentId} | Combat Fitness`,
    html,
  });
}

module.exports = { sendExpiryReminder, sendPaymentReceipt, sendPasswordReset };

/**
 * Send password reset email
 */
async function sendPasswordReset(user, resetUrl) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#f4f4f5;border-radius:12px;overflow:hidden;">
      <div style="background:#e11d48;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;">🔐 Password Reset</h1>
        <p style="margin:4px 0 0;color:#fecdd3;font-size:13px;">Combat Fitness</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;">Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to proceed. This link expires in <strong>30 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#e11d48;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Reset My Password</a>
        </div>
        <p style="color:#71717a;font-size:13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        <p style="color:#52525b;font-size:12px;word-break:break-all;">Or copy this link: ${resetUrl}</p>
      </div>
      <div style="background:#18181b;padding:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#52525b;">© 2026 Combat Fitness. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Combat Fitness" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: `[Combat Fitness] Reset Your Password`,
    html,
  });
}

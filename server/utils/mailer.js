const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 465, secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

exports.sendOtp = (to, name, otp) => transporter.sendMail({
  from: process.env.MAIL_FROM, to, subject: `${otp} is your CodeCart verification code`,
  html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:28px;background:#0e0b1f;color:#eae8ff;border-radius:16px">
    <h2 style="margin:0 0 8px;color:#a99bff">CodeCart</h2><p>Hi ${esc(name)}, use this code to verify your email:</p>
    <div style="font-size:34px;letter-spacing:10px;font-weight:700;padding:16px;background:#1a1536;border-radius:12px;text-align:center;color:#22d3ee">${otp}</div>
    <p style="color:#9b97bd;font-size:13px">It expires in 10 minutes. If you did not sign up, ignore this email.</p></div>`,
});

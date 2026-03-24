// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

// export const sendEmail = async ({ to, subject, html }) => {
//     try {
//         await transporter.sendMail({
//             from: process.env.SMTP_FROM,
//             to,
//             subject,
//             html,
//         });
//         console.log(`Email sent to ${to}`);
//     } catch (error) {
//         console.error(`Email error: ${error.message}`);
//         throw new Error("Email could not be sent");
//     }
// };

// // ── Email Templates ──────────────────────────────────────────

// export const appointmentConfirmationEmail = (patientName, doctorName, date, time) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//     <h2 style="color: #0ea5e9;">MediCore — Appointment Confirmed</h2>
//     <p>Dear <strong>${patientName}</strong>,</p>
//     <p>Your appointment has been successfully booked.</p>
//     <table style="width:100%; border-collapse:collapse; margin-top:10px;">
//       <tr><td style="padding:8px; background:#f0f9ff;"><strong>Doctor</strong></td><td style="padding:8px;">Dr. ${doctorName}</td></tr>
//       <tr><td style="padding:8px; background:#f0f9ff;"><strong>Date</strong></td><td style="padding:8px;">${date}</td></tr>
//       <tr><td style="padding:8px; background:#f0f9ff;"><strong>Time</strong></td><td style="padding:8px;">${time}</td></tr>
//     </table>
//     <p style="margin-top:20px; color:#64748b;">Please arrive 10 minutes early. For any changes, contact the hospital reception.</p>
//     <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
//   </div>
// `;

// export const passwordResetEmail = (name, resetLink) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//     <h2 style="color: #0ea5e9;">MediCore — Password Reset</h2>
//     <p>Dear <strong>${name}</strong>,</p>
//     <p>We received a request to reset your password. Click the button below:</p>
//     <a href="${resetLink}" style="display:inline-block; margin:20px 0; padding:12px 24px; background:#0ea5e9; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">Reset Password</a>
//     <p style="color:#64748b;">This link expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.</p>
//     <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
//   </div>
// `;

// export const labReportReadyEmail = (patientName, testName) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//     <h2 style="color: #0ea5e9;">MediCore — Lab Report Ready</h2>
//     <p>Dear <strong>${patientName}</strong>,</p>
//     <p>Your lab report for <strong>${testName}</strong> is now ready.</p>
//     <p>Please log in to your patient portal or visit the reception to collect your report.</p>
//     <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
//   </div>
// `;



//  new

import nodemailer from "nodemailer";

// ✅ FIX: Create transporter lazily inside the function, not at module load time.
// At module load time, dotenv hasn't run yet so all process.env.SMTP_* are undefined,
// causing nodemailer to fall back to 127.0.0.1:587 (localhost) → ECONNREFUSED.
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter(); // ✅ created fresh each time, env is ready now
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw new Error("Email could not be sent");
  }
};

// ── Email Templates ──────────────────────────────────────────

export const appointmentConfirmationEmail = (patientName, doctorName, date, time) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #0ea5e9;">MediCore — Appointment Confirmed</h2>
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Your appointment has been successfully booked.</p>
    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
      <tr><td style="padding:8px; background:#f0f9ff;"><strong>Doctor</strong></td><td style="padding:8px;">Dr. ${doctorName}</td></tr>
      <tr><td style="padding:8px; background:#f0f9ff;"><strong>Date</strong></td><td style="padding:8px;">${date}</td></tr>
      <tr><td style="padding:8px; background:#f0f9ff;"><strong>Time</strong></td><td style="padding:8px;">${time}</td></tr>
    </table>
    <p style="margin-top:20px; color:#64748b;">Please arrive 10 minutes early. For any changes, contact the hospital reception.</p>
    <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
  </div>
`;

export const passwordResetEmail = (name, resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #0ea5e9;">MediCore — Password Reset</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below:</p>
    <a href="${resetLink}" style="display:inline-block; margin:20px 0; padding:12px 24px; background:#0ea5e9; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">Reset Password</a>
    <p style="color:#64748b;">This link expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.</p>
    <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
  </div>
`;

export const labReportReadyEmail = (patientName, testName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #0ea5e9;">MediCore — Lab Report Ready</h2>
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Your lab report for <strong>${testName}</strong> is now ready.</p>
    <p>Please log in to your patient portal or visit the reception to collect your report.</p>
    <p style="color:#0ea5e9; font-weight:bold;">MediCore Hospital Management</p>
  </div>
`;
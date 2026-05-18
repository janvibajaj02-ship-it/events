const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const sendAttendanceNotificationEmail = async ({ organizerEmail, organizerName, eventTitle, studentName, studentEmail, attendedAt }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter || !organizerEmail) {
    return { sent: false, reason: 'Mailer not configured' };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.MAIL_USER;

  await activeTransporter.sendMail({
    from,
    to: organizerEmail,
    subject: `Attendance confirmed for ${eventTitle}`,
    text: [
      `Hello ${organizerName || 'Organizer'},`,
      '',
      `Attendance has been recorded for ${studentName}.`,
      `Event: ${eventTitle}`,
      `Student Email: ${studentEmail}`,
      `Attendance Time: ${new Date(attendedAt).toLocaleString('en-IN')}`,
      '',
      'This student has successfully attended the event.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Attendance Confirmed</h2>
        <p>Hello ${organizerName || 'Organizer'},</p>
        <p><strong>${studentName}</strong> has been marked present for <strong>${eventTitle}</strong>.</p>
        <p><strong>Student Email:</strong> ${studentEmail}</p>
        <p><strong>Attendance Time:</strong> ${new Date(attendedAt).toLocaleString('en-IN')}</p>
      </div>
    `,
  });

  return { sent: true };
};

module.exports = {
  sendAttendanceNotificationEmail,
};

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: process.env.GMAIL_SERVICE_NAME,
      host: process.env.GMAIL_SERVICE_HOST,
      secure: process.env.GMAIL_SERVICE_SECURE,
      port: process.env.GMAIL_SERVICE_PORT,
      ignoreTLS: false,
      auth: {
        user: process.env.GMAIL_USER_NAME,
        pass: process.env.GMAIL_USER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.GMAIL_USER_NAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
};

module.exports = sendEmail;

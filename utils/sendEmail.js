const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

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

  var handlebarsOptions = {
    viewEngine: {
      extName: '.handlebars',
      // layoutsDir: path.resolve(__dirname, '../views'),
      // partialsDir: path.resolve(__dirname, '../views'),
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../views'),
    extName: '.handlebars',
  };

  transporter.use('compile', hbs(handlebarsOptions));

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.GMAIL_USER_NAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    template: options.template,
    context: options.context,
  };

  await transporter.sendMail(message);
  transporter.close();
};

module.exports = sendEmail;

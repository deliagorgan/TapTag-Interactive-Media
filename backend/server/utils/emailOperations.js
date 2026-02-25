const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const {logError, logSuccess} = require('./logConsole.js');

const prefix = "LOG(emailOperations.js): ";
const saltSize = 16;


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  })


/*
    functie care construieste URL custom pe baza ID-ului user-ului
*/
function generateVerificationURL(id, path, host) {
    const salt = crypto.randomBytes(saltSize).toString('hex');

    const token = jwt.sign({id: id, salt: salt}, process.env.JWT_SECRET, { expiresIn: '5m' });

    return `${host}/${path}/${token}`;
}

/*
    functie care trimite un email cu un link de verificare a contului

    mode = 1 => email pentru validarea contului
    mode = 2 => email pentru resetarea parolei
*/
async function sendEmail(userID, to, mode, host) {
    try {
        /*
            se initializeaza campurile mail-ului
        */
        let url, subject, text, html;
        if (mode == 1) {
            url = generateVerificationURL(userID, 'validate/email', host);

            subject = 'Welcome to TapTag - Please Verify Your Email';
            text = `Hi there!

            Thank you for joining our platform.
            To complete your registration, please verify your email address by clicking the link below:

            ${url}

            If you did not request this email, you can safely ignore it.

            Best regards,
            The TapTag Team`;
            
            html = `
            <p>Hi there!</p>

            <p>Thank you for joining our platform.</p>
            <p>To complete your registration, please verify your email address by clicking the link below:</p>

            <p><a href="${url}">${url}</a></p>

            <p>If you did not request this email, you can safely ignore it.</p>

            <p>Best regards,<br/>The TapTag Team</p>
            `;

        } else if (mode == 2) {
            url = generateVerificationURL(userID, 'reset/password', host);

            subject = "Forgot your TapTag password? Let's reset it";
            text = `Hello,

            We received a request to reset your TapTag password. Click the link below to choose a new password:

            ${url}

            If you didn't request a password reset, you can safely ignore this email.`;
            
            html = `<p>Hello,</p>
            <p>We received a request to reset your TapTag password. Click the link below to choose a new password:</p>
            <p><a href="${url}">${url}</a></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>`;

        }

        

        /*
            se trimite email-ul
        */
        const info = await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to,
            subject,
            text,
            html
        });

        logSuccess(prefix, 'Email sent to: ' + to);

        return info;
    } catch (error) {
        logError(prefix, 'Error sending email:' + error);
        return null;
    }
}

module.exports = {sendEmail};

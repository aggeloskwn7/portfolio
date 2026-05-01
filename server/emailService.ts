import nodemailer from 'nodemailer';
import type { Message } from '@shared/schema';
const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_SERVICE } = process.env;
if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_SERVICE) {
    console.warn('Email service not configured properly. Missing email credentials.');
}
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});
export async function sendContactEmail(message: Message): Promise<boolean> {
    if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_SERVICE) {
        console.error('Email service not configured properly');
        return false;
    }
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: EMAIL_USER,
            replyTo: message.email,
            subject: `Portfolio Contact: ${message.subject}`,
            html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${message.name}</p>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          ${message.message.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This message was sent from your portfolio website contact form.
        </p>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

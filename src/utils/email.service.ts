import nodemailer from 'nodemailer';

// For development, use ethereal.email (fake SMTP for testing)
// In production, use your actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export interface WelcomeEmailData {
  email: string;
  username: string;
  password: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Welcome to Collectible Trading Post! 🎉</h2>
      <p>Hello <strong>${data.username}</strong>,</p>
      <p>Your account has been successfully created. Here are your login credentials:</p>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
        <p style="margin: 8px 0;"><strong>Username:</strong> ${data.username}</p>
        <p style="margin: 8px 0;"><strong>Password:</strong> ${data.password}</p>
      </div>
      
      <p>Please keep your credentials safe. You can change your password after logging in.</p>
      <p>Start exploring and trading collectibles now!</p>
      
      <a href="http://localhost:3000" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Go to Marketplace
      </a>
      
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

  const text = `
Welcome to Collectible Trading Post!

Your account has been created:
Email: ${data.email}
Username: ${data.username}
Password: ${data.password}

Please keep your credentials safe.

Visit: http://localhost:3000
  `;

  try {
    // For development, just log the email
    console.log('📧 Welcome email would be sent to:', data.email);
    console.log('Email content:', text);
    
    // In production with real SMTP, uncomment below:
    // await transporter.sendMail({
    //   from: authConfig.emailFrom,
    //   to: data.email,
    //   subject: 'Welcome to Collectible Trading Post!',
    //   text,
    //   html,
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
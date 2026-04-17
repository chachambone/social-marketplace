export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: '7d',
  bcryptSaltRounds: 10,
  emailFrom: process.env.EMAIL_FROM || 'marketplace@interintel.co.ke',
};
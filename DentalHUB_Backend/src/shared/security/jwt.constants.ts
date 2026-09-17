export const jwtConstanst = {
  secret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
};

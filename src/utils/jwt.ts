import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any
  };
  
  return jwt.sign(
    { id: userId, email, role },
    secret,
    options
  );
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.verify(token, secret);
};

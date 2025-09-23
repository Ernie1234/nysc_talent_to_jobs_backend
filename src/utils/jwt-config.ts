import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import envConfig from '@/config/env-config';

const env = envConfig();

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'y';
type TimeString = `${number}${TimeUnit}`;

export type AccessTokenPayload = {
  userId: string;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
  expiresIn?: TimeString | number;
};

const defaults: SignOptions = {
  audience: ['user'],
};

const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: env.JWT_EXPIRES_IN as TimeString,
  secret: env.JWT_SECRET as string,
};

export const signJwtToken = (
  payload: AccessTokenPayload,
  options?: SignOptsAndSecret
): {
  token: string;
  expiresAt: number | undefined;
} => {
  const isAccessToken = !options || options === accessTokenSignOptions;

  const { secret, ...opts } = options ?? accessTokenSignOptions;

  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

  const decodedPayload = jwt.decode(token) as JwtPayload;
  const expiresAt = isAccessToken && decodedPayload?.exp ? decodedPayload.exp * 1000 : undefined;

  return {
    token,
    expiresAt,
  };
};

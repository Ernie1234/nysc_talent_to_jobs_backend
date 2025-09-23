// In your auth-service.ts file

import { IUser, UserModel } from '@/models/user-model';
import { NotFoundException, UnauthorizedException } from '@/utils/app-error';
import { signJwtToken } from '@/utils/jwt-config';
import { LoginSchemaType, RegisterSchemaType } from '@/validations/auth-validation';

export const registerService = async (
  body: RegisterSchemaType
): Promise<{
  user: Omit<IUser, 'password'>;
}> => {
  const { email } = body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) throw new UnauthorizedException('User already exists');

  const newUser = new UserModel({
    ...body,
  });

  await newUser.save(); // Use the omitPassword method for consistency

  return { user: newUser.omitPassword() };
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await UserModel.findOne({ email }).select('+password'); // Select password explicitly
  if (!user) throw new NotFoundException('Email/password not found');

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) throw new UnauthorizedException('Invalid email/password');

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
  };
};

/* eslint-disable max-len */
// In your auth-service.ts file

import { IUser, UserModel } from '@/models/user-model';
import { NotFoundException, UnauthorizedException } from '@/utils/app-error';
import { signJwtToken } from '@/utils/jwt-config';
import { LoginSchemaType, RegisterSchemaType } from '@/validations/auth-validation';

// NITDA staff profile configuration
const NITDA_STAFF_PROFILE = {
  companyName: 'National Information Technology Development Agency (NITDA)',
  companySize: '1000+',
  industry: 'technology',
  companyDescription:
    // eslint-disable-next-line quotes
    "NITDA's mandates are quite diverse and vast, focusing on the responsibilities of the Agency on fostering the development and growth of IT in Nigeria.",
  website: 'https://nitda.gov.ng/',
  contactNumber: '+2348168401851',
  location: 'abuja',
};

export const registerService = async (
  body: RegisterSchemaType
): Promise<{
  user: Omit<IUser, 'password'>;
}> => {
  const { email, firstName, lastName, password, role } = body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) throw new UnauthorizedException('User already exists');

  // Determine role and profile based on email
  let userRole = role;
  let staffProfile = undefined;
  let onboardingCompleted = false;

  // Auto-detect NITDA users and set up their profile
  if (email.toLowerCase().endsWith('@nitda.gov.ng')) {
    userRole = 'STAFF';
    staffProfile = NITDA_STAFF_PROFILE;
    onboardingCompleted = true;

    // Log the automatic NITDA user creation
    console.log(`Creating NITDA user: ${email} with auto-filled staff profile`);
  }

  // Create user data
  const userData: any = {
    email,
    firstName,
    lastName,
    password,
    role: userRole,
    onboardingCompleted,
    staffProfile,
  };

  const newUser = new UserModel(userData);
  await newUser.save();

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

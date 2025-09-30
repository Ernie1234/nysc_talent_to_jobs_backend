/* eslint-disable max-len */
// In your auth-service.ts file

import { IUser, UserModel } from '@/models/user-model';
import { NotFoundException, UnauthorizedException } from '@/utils/app-error';
import { signJwtToken } from '@/utils/jwt-config';
import { LoginSchemaType, RegisterSchemaType } from '@/validations/auth-validation';

// NITDA employer profile configuration
const NITDA_EMPLOYER_PROFILE = {
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
  let employerProfile = undefined;
  let onboardingCompleted = false;

  // Auto-detect NITDA users and set up their profile
  if (email.toLowerCase().endsWith('@nitda.gov.ng')) {
    userRole = 'employer';
    employerProfile = NITDA_EMPLOYER_PROFILE;
    onboardingCompleted = true; // NITDA users skip onboarding

    // Log the automatic NITDA user creation
    console.log(`Creating NITDA user: ${email} with auto-filled employer profile`);
  }

  // Create user data
  const userData: any = {
    email,
    firstName,
    lastName,
    password,
    role: userRole,
    onboardingCompleted,
    employerProfile,
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

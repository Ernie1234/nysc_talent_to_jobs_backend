import { Types } from 'mongoose';
import { UserModel } from '@/models/user-model';
import { IUser } from '@/models/user-model';
import { NotFoundException } from '@/utils/app-error';
import { UserUpdateSchemaType } from '@/validations/auth-validation';

/**
 * Finds a user by their ID and returns the full user document.
 * It's the controller's responsibility to handle the case where the user is not found.
 */
export const findByIdUserService = async (userId: string): Promise<IUser | null> => {
  const user = await UserModel.findById(userId)
    .select('-password -passwordResetToken -emailVerificationToken')
    .exec();
  return user;
};

/**
 * Updates a user's profile information using a single atomic operation.
 * @param userId - The ID of the user to update.
 * @param updateData - The validated data to update the user with.
 * @param profilePic - The uploaded profile picture file (optional).
 * @returns The updated user document.
 */
export const updateUserService = async (
  userId: Types.ObjectId,
  updateData: UserUpdateSchemaType & { restOfBody?: any },
  // eslint-disable-next-line no-undef
  profilePic?: Express.Multer.File | undefined
): Promise<IUser | null> => {
  // Construct the update object dynamically
  const updateQuery: any = {
    $set: {
      ...updateData.profile,
      ...updateData.staffProfile,
      ...updateData.restOfBody,
    },
  };

  if (profilePic) {
    updateQuery.$set['profile.profilePicture'] = profilePic.path;
  }

  const user = await UserModel.findByIdAndUpdate(userId, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user.omitPassword();
};

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '@/models/User';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as any);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login
          user.lastLoginAt = new Date();
          await user.save();
          return done(null, user as any);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.provider = 'google';
          user.isEmailVerified = true;
          user.lastLoginAt = new Date();
          
          // Update avatar if not set
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          
          await user.save();
          return done(null, user as any);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          provider: 'google',
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          avatar: profile.photos?.[0]?.value,
          isEmailVerified: true,
          lastLoginAt: new Date(),
        });

        await newUser.save();
        done(null, newUser as any);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, false);
      }
    }
  )
);

export default passport;
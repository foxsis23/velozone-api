import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../../models/index.js';
import logger from '../utils/logger.js';

export function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google profile'), null);
          }

          // Find by google_id or email
          let user = await User.findOne({
            where: { google_id: profile.id },
          });

          if (!user) {
            user = await User.findOne({ where: { email } });

            if (user) {
              // Link Google account to existing user
              await user.update({
                google_id: profile.id,
                avatar_url: user.avatar_url || profile.photos?.[0]?.value,
                is_email_verified: true,
              });
            } else {
              // Create new user from Google profile
              user = await User.create({
                username: profile.displayName || email.split('@')[0],
                email,
                google_id: profile.id,
                avatar_url: profile.photos?.[0]?.value,
                is_email_verified: true,
                role: 'user',
              });
              logger.info(`New user created via Google OAuth: ${email}`);
            }
          }

          return done(null, user);
        } catch (err) {
          logger.error(`Google OAuth strategy error: ${err.message}`, err);
          return done(err, null);
        }
      }
    )
  );
}

import passport from 'passport'
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20'
import { env } from './env'
import { findOrCreateGoogleUser } from '../services/auth/auth.service'
import type { AuthUser } from '../types/auth'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('Aucun email associé au compte Google'))

        const user = await findOrCreateGoogleUser({
          googleId: profile.id,
          email,
          displayName: profile.displayName,
        })

        return done(null, user)
      } catch (err) {
        return done(err as Error)
      }
    },
  ),
)

// Sessions non utilisées (JWT stateless) — sérialisation minimale requise par Passport
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user as AuthUser))

export default passport

import passport from 'passport'
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from '../db/schema'
import { env } from './env'
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
        if (!email) {
          return done(new Error('Aucun email associé au compte Google'))
        }

        // Chercher un user existant par google_id ou par email
        let user = await db.query.users.findFirst({
          where: eq(users.googleId, profile.id),
        })

        if (!user) {
          user = await db.query.users.findFirst({
            where: eq(users.email, email),
          })
        }

        if (user) {
          // Lier le google_id si l'user existe déjà (compte local)
          if (!user.googleId) {
            await db
              .update(users)
              .set({ googleId: profile.id })
              .where(eq(users.id, user.id))
          }
        } else {
          // Créer un nouvel utilisateur OAuth (sans password)
          const [created] = await db
            .insert(users)
            .values({
              name: profile.displayName,
              email,
              googleId: profile.id,
              password: null,
            })
            .returning()
          user = created
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          role: user.role,
        }
        return done(null, authUser)
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

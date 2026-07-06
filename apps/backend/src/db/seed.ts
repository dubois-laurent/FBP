import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { Pool } from 'pg'
import { env } from '../config/env'
import { users, events, bookings } from '../db/schema'

const pool = new Pool({ connectionString: env.DATABASE_URL })
const db = drizzle(pool)

async function seed() {
  console.log('🌱 Seeding database…')

  // ── Users ────────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const userPassword = await bcrypt.hash('User1234!', 12)

  const [admin, alice, bob] = await db
    .insert(users)
    .values([
      {
        name: 'Admin Festival',
        email: 'admin@festival.com',
        password: adminPassword,
        role: 'admin',
      },
      {
        name: 'Alice Martin',
        email: 'alice@example.com',
        password: userPassword,
        role: 'user',
      },
      {
        name: 'Bob Dupont',
        email: 'bob@example.com',
        password: userPassword,
        role: 'user',
      },
    ])
    .returning()

  console.log(`  ✓ ${3} utilisateurs créés`)

  // ── Events ───────────────────────────────────────────────────────────────────
  const now = new Date()
  const d = (offsetDays: number, hour = 14) => {
    const date = new Date(now)
    date.setDate(date.getDate() + offsetDays)
    date.setHours(hour, 0, 0, 0)
    return date
  }

  const insertedEvents = await db
    .insert(events)
    .values([
      {
        title: 'Regards Croises - Photographes du Monde',
        description: "Une exposition collective reunissant 12 photographes internationaux autour du theme de la memoire et de l'identite. Plus de 200 tirages grand format sur papier baryte.",
        type: 'exposition',
        venue: 'Grande Galerie, Palais des Arts',
        date: d(5, 10),
        totalSeats: 200,
        availableSeats: 200,
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
      },
      {
        title: 'Masterclass : Lumiere Naturelle en Portrait',
        description: "Deux jours intensifs avec la photographe Camille Aubert. Travail en conditions reelles, retours personnalises, portfolio review. Materiel fourni.",
        type: 'atelier',
        venue: 'Studio Atelier 12, Rue des Arts',
        date: d(10, 9),
        totalSeats: 12,
        availableSeats: 12,
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      },
      {
        title: 'Photojournalisme : Temoigner Sans Trahir',
        description: "Conference avec trois photojournalistes de renommee internationale. Debat autour de l'ethique, des droits a l'image et de la responsabilite du temoignage visuel.",
        type: 'conference',
        venue: 'Amphitheatre Victor Hugo',
        date: d(7, 15),
        totalSeats: 120,
        availableSeats: 120,
        imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
      },
      {
        title: 'Soiree Rencontre - Collectif Noir & Blanc',
        description: "Soiree conviviale organisee par le Collectif N&B. Projection de portfolios, echanges informels autour d'un verre. Ouverte a tous niveaux, amateur comme professionnel.",
        type: 'rencontre',
        venue: 'Bar Le Chambre Noire',
        date: d(3, 19),
        totalSeats: 60,
        availableSeats: 60,
        imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      },
      {
        title: 'Argentique : Developpement en Chambre Noire',
        description: "Atelier pratique d'initiation au developpement argentique. Chaque participant repart avec ses propres tirages noir et blanc. Produits chimiques et pellicules inclus.",
        type: 'atelier',
        venue: 'Labo Photo Ephemere, Sous-sol',
        date: d(14, 13),
        totalSeats: 8,
        availableSeats: 8,
        imageUrl: 'https://images.unsplash.com/photo-1461696114087-397271a7aedc?w=800',
      },
      {
        title: 'Paysages Urbains - Cartier-Breton Prize 2026',
        description: "Exposition des 30 finalistes du Prix Cartier-Breton 2026, categorie paysage urbain. Vernissage en presence du jury. Entree libre, visite guidee sur inscription.",
        type: 'exposition',
        venue: 'Fondation du Regard, Galerie B',
        date: d(2, 18),
        totalSeats: 300,
        availableSeats: 300,
        imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
      },
    ])
    .returning()

  console.log(`  ✓ ${insertedEvents.length} événements créés`)

  // ── Bookings ─────────────────────────────────────────────────────────────────
  const [expo1, workshop1, , , , expo2] = insertedEvents

  await db.insert(bookings).values([
    { userId: alice.id, eventId: expo1.id, status: 'confirmed' },
    { userId: alice.id, eventId: workshop1.id, status: 'confirmed' },
    { userId: bob.id, eventId: expo1.id, status: 'confirmed' },
    { userId: bob.id, eventId: expo2.id, status: 'cancelled' },
  ])

  // Décrémenter availableSeats pour les réservations confirmées
  await db
    .update(events)
    .set({ availableSeats: expo1.availableSeats - 2 })
    .where(eq(events.id, expo1.id))
  await db
    .update(events)
    .set({ availableSeats: workshop1.availableSeats - 1 })
    .where(eq(events.id, workshop1.id))

  console.log(`  ✓ 4 réservations créées`)
  console.log('')
  console.log('✅ Seed terminée !')
  console.log('')
  console.log('  Comptes disponibles :')
  console.log('  👑 admin@festival.com  /  Admin1234!')
  console.log('  👤 alice@example.com   /  User1234!')
  console.log('  👤 bob@example.com     /  User1234!')
}

seed()
  .catch((err) => {
    console.error('❌ Seed échouée :', err)
    process.exit(1)
  })
  .finally(() => pool.end())

CREATE TYPE "public"."role" AS ENUM('user', 'admin');
CREATE TYPE "public"."event_type" AS ENUM('exposition', 'conference', 'atelier', 'rencontre');
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled');


CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"role" "role" DEFAULT 'user' NOT NULL,
	"google_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);

CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"venue" varchar(255) NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"image_url" varchar(500),
	"type" "event_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
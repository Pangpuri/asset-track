CREATE TYPE "public"."action_type" AS ENUM('create', 'update', 'assign', 'transfer', 'return', 'repair', 'damage', 'lost');--> statement-breakpoint
ALTER TABLE "assignments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "assignments" CASCADE;--> statement-breakpoint
DROP TABLE "service_requests" CASCADE;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "action" SET DATA TYPE "public"."action_type" USING "action"::"public"."action_type";--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "service_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "repair_cost" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "vendor" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "is_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "assigned_to_id" uuid;--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "handled_by" varchar(100);--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "action_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "condition" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "current_location" text;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_assigned_to_id_employees_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "assigned_to";--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "assigned_by";--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "delivery_date";--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "return_date";--> statement-breakpoint
ALTER TABLE "logs" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "reported_at";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "assigned_at";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "resolved_by";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "notification_sent";
DROP TABLE "services" CASCADE;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."action_type";--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('create', 'update', 'assign', 'transfer', 'return', 'damage', 'lost');--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "action" SET DATA TYPE "public"."action_type" USING "action"::"public"."action_type";--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."asset_status";--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('active', 'broken', 'lost', 'retired', 'pending');--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."asset_status";--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "status" SET DATA TYPE "public"."asset_status" USING "status"::"public"."asset_status";--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "asset_name" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "factory" text;--> statement-breakpoint
DROP TYPE "public"."priority";--> statement-breakpoint
DROP TYPE "public"."service_status";
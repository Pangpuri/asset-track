ALTER TYPE "public"."action_type" ADD VALUE 'retire';--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "deleted_at" timestamp with time zone DEFAULT null;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "disposal_reason" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "disposal_method" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "disposal_value" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "disposal_authorized_by" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "warranty_status" text DEFAULT 'date';
ALTER TYPE "public"."asset_status" ADD VALUE 'pending';--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "asset_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "category" DROP NOT NULL;
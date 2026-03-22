-- Convert existing string ratings to integers, then change column type
UPDATE "neetcode_progress" SET "last_rating" = NULL WHERE "last_rating" IS NOT NULL;
ALTER TABLE "neetcode_progress" ALTER COLUMN "last_rating" TYPE INTEGER USING "last_rating"::integer;

-- AddColumn
ALTER TABLE "neetcode_progress" ADD COLUMN IF NOT EXISTS "mastery_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "neetcode_progress" ADD COLUMN IF NOT EXISTS "notes" TEXT;

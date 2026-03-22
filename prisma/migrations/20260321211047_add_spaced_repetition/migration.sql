-- AlterTable
ALTER TABLE "biome_progress" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "focus_sessions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neetcode_progress" ADD COLUMN     "interval_days" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_rating" TEXT,
ADD COLUMN     "mastered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "next_review_date" DATE,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "neetcode_progress_user_id_next_review_date_idx" ON "neetcode_progress"("user_id", "next_review_date");

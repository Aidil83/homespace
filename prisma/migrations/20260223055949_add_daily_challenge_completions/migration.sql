-- CreateTable
CREATE TABLE "daily_challenge_completions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "difficulty" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "elapsed_sec" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenge_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_challenge_completions_user_id_idx" ON "daily_challenge_completions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenge_completions_user_id_date_difficulty_key" ON "daily_challenge_completions"("user_id", "date", "difficulty");

-- CreateTable
CREATE TABLE "neetcode_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "problem_id" TEXT NOT NULL,
    "elapsed_sec" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neetcode_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "neetcode_attempts_user_id_problem_id_idx" ON "neetcode_attempts"("user_id", "problem_id");

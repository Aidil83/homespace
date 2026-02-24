-- CreateTable
CREATE TABLE "neetcode_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "problem_id" TEXT NOT NULL,
    "elapsed_sec" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neetcode_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "neetcode_progress_user_id_idx" ON "neetcode_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "neetcode_progress_user_id_problem_id_key" ON "neetcode_progress"("user_id", "problem_id");

-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "biome" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "elapsed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "collectible" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biome_progress" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "biome" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "collectibles" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biome_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "focus_sessions_user_id_idx" ON "focus_sessions"("user_id");

-- CreateIndex
CREATE INDEX "focus_sessions_user_id_biome_idx" ON "focus_sessions"("user_id", "biome");

-- CreateIndex
CREATE INDEX "focus_sessions_user_id_created_at_idx" ON "focus_sessions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "biome_progress_user_id_biome_key" ON "biome_progress"("user_id", "biome");

-- CreateIndex
CREATE INDEX "biome_progress_user_id_idx" ON "biome_progress"("user_id");

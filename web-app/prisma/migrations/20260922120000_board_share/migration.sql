-- CreateEnum
CREATE TYPE "ShareMode" AS ENUM ('EMAIL', 'PUBLIC');

-- CreateTable
CREATE TABLE "BoardShare" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "mode" "ShareMode" NOT NULL,
    "token" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardShare_token_key" ON "BoardShare"("token");

-- CreateIndex
CREATE INDEX "BoardShare_recipientEmail_idx" ON "BoardShare"("recipientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "BoardShare_boardId_recipientEmail_key" ON "BoardShare"("boardId", "recipientEmail");

-- AddForeignKey
ALTER TABLE "BoardShare" ADD CONSTRAINT "BoardShare_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

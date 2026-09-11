-- CreateTable
CREATE TABLE "Limbo" (
    "id" TEXT NOT NULL,
    "tasks" JSONB NOT NULL DEFAULT '[]',
    "boardId" TEXT NOT NULL,

    CONSTRAINT "Limbo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Limbo_boardId_key" ON "Limbo"("boardId");

-- AddForeignKey
ALTER TABLE "Limbo" ADD CONSTRAINT "Limbo_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

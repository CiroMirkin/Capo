-- AlterTable
ALTER TABLE "TagGroup" ADD COLUMN     "boardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TagGroup_boardId_key" ON "TagGroup"("boardId");

-- AddForeignKey
ALTER TABLE "TagGroup" ADD CONSTRAINT "TagGroup_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

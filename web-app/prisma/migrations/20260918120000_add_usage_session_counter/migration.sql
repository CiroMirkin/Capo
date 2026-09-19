-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "currentSessionStart" BIGINT,
ADD COLUMN     "currentSessionEnd" BIGINT,
ADD COLUMN     "currentSessionDuration" INTEGER,
ADD COLUMN     "currentSessionDay" BIGINT;

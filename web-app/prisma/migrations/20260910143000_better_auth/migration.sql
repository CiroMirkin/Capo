-- Migración NextAuth v5 (Auth.js) -> Better Auth.
-- Renombra columnas en vez de drop+add para preservar la cuenta GitHub y los
-- hashes bcrypt existentes. Ver docs/ignore/migracion-next-auth-a-better-auth.md.

-- User -----------------------------------------------------------------------
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
UPDATE "User" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL OR "name" = '';
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- Account: renombres Auth.js -> Better Auth ---------------------------------
ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "Account" RENAME COLUMN "access_token" TO "accessToken";
ALTER TABLE "Account" RENAME COLUMN "refresh_token" TO "refreshToken";
ALTER TABLE "Account" RENAME COLUMN "id_token" TO "idToken";

ALTER TABLE "Account" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN "password" TEXT;
ALTER TABLE "Account" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" DROP DEFAULT;

UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at") AT TIME ZONE 'UTC'
WHERE "expires_at" IS NOT NULL;

ALTER TABLE "Account"
  DROP COLUMN "expires_at",
  DROP COLUMN "type",
  DROP COLUMN "token_type",
  DROP COLUMN "session_state";

DROP INDEX "Account_provider_providerAccountId_key";
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- Cuentas "credential" desde los hashes bcrypt de User.password ------------
INSERT INTO "Account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'credential', "id", "password", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User" WHERE "password" IS NOT NULL;

ALTER TABLE "User" DROP COLUMN "password";

-- Session ------------------------------------------------------------------
ALTER TABLE "Session" RENAME COLUMN "sessionToken" TO "token";
ALTER TABLE "Session" RENAME COLUMN "expires" TO "expiresAt";
ALTER TABLE "Session" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Session" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN "userAgent" TEXT;
DROP INDEX "Session_sessionToken_key";
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- VerificationToken -> Verification ---------------------------------------
ALTER TABLE "VerificationToken" RENAME TO "Verification";
ALTER TABLE "Verification" RENAME COLUMN "token" TO "value";
ALTER TABLE "Verification" RENAME COLUMN "expires" TO "expiresAt";
DROP INDEX "VerificationToken_token_key";
DROP INDEX "VerificationToken_identifier_token_key";
ALTER TABLE "Verification" ADD COLUMN "id" TEXT;
UPDATE "Verification" SET "id" = gen_random_uuid()::text;
ALTER TABLE "Verification" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_pkey" PRIMARY KEY ("id");
ALTER TABLE "Verification" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Verification" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Verification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Rollback (manual, si hace falta):
--   ALTER TABLE "User" ADD COLUMN "password" TEXT;
--   UPDATE "User" u SET "password" = a."password" FROM "Account" a
--     WHERE a."userId" = u."id" AND a."providerId" = 'credential';
--   ...renames inversos + DROP de las columnas nuevas.

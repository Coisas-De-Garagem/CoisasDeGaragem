/*
  Warnings:

  - The values [BUYER,SELLER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
    CASE 
        WHEN "role"::text IN ('BUYER', 'SELLER') THEN 'USER'::"UserRole_new"
        ELSE "role"::text::"UserRole_new"
    END
);
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

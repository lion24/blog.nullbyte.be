-- CreateEnum
CREATE TYPE "Role" AS ENUM ('READER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'READER';
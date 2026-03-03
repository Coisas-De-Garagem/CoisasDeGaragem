-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "abacatePaymentId" TEXT,
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentQr" TEXT,
ADD COLUMN     "paymentQrUrl" TEXT,
ADD COLUMN     "paymentStatus" TEXT;

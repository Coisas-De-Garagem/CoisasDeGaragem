-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GarageEvent" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "street" TEXT,
    "number" TEXT,
    "district" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVisit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GarageEvent_qrCode_key" ON "GarageEvent"("qrCode");

-- AddColumn (vínculo 1:1 produto → evento)
ALTER TABLE "Product" ADD COLUMN "eventId" TEXT;

-- CreateForeignKey
ALTER TABLE "GarageEvent"
    ADD CONSTRAINT "GarageEvent_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateForeignKey (com ON DELETE CASCADE — visitas somem se o evento for excluído)
ALTER TABLE "EventVisit"
    ADD CONSTRAINT "EventVisit_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GarageEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateForeignKey (produto → evento, opcional)
ALTER TABLE "Product"
    ADD CONSTRAINT "Product_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GarageEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex (acelera consultas de visitas por evento)
CREATE INDEX "EventVisit_eventId_idx" ON "EventVisit"("eventId");

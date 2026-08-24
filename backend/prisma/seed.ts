import { PrismaClient, UserRole, ProductCondition } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting staging/test database seed process...');

  // Hash test password securely
  const passwordHash = await bcrypt.hash('StagingTest123!', 10);

  // 1. Create Test Seller User
  const seller = await prisma.user.upsert({
    where: { email: 'test.seller@garagesale.local' },
    update: { password: passwordHash },
    create: {
      email: 'test.seller@garagesale.local',
      name: 'Vendedor Teste Garagem',
      password: passwordHash,
      role: UserRole.USER,
      phone: '11999998888',
      isActive: true,
    },
  });

  // 2. Create Test Buyer User
  const buyer = await prisma.user.upsert({
    where: { email: 'test.buyer@garagesale.local' },
    update: { password: passwordHash },
    create: {
      email: 'test.buyer@garagesale.local',
      name: 'Comprador Teste Garagem',
      password: passwordHash,
      role: UserRole.USER,
      phone: '11977776666',
      isActive: true,
    },
  });

  // 3. Create Mock Products for Test Garage Sale
  const product1 = await prisma.product.upsert({
    where: { qrCode: 'QR-TEST-MOCK-001' },
    update: {},
    create: {
      sellerId: seller.id,
      name: 'Bicicleta Vintage Aro 26',
      description: 'Bicicleta antiga restaurada, ótima para passeios urbanos.',
      price: 250.00,
      category: 'Esportes e Lazer',
      condition: ProductCondition.GOOD,
      qrCode: 'QR-TEST-MOCK-001',
      isAvailable: true,
      isReserved: false,
      isSold: false,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { qrCode: 'QR-TEST-MOCK-002' },
    update: {},
    create: {
      sellerId: seller.id,
      name: 'Poltrona Retro de Couro',
      description: 'Poltrona clássica de couro sintético marrom.',
      price: 180.00,
      category: 'Móveis',
      condition: ProductCondition.LIKE_NEW,
      qrCode: 'QR-TEST-MOCK-002',
      isAvailable: true,
      isReserved: false,
      isSold: false,
    },
  });

  console.log('✅ Staging Database Seed Completed Successfully!');
  console.log(`   - Seller: ${seller.email}`);
  console.log(`   - Buyer:  ${buyer.email}`);
  console.log(`   - Mock Products Created: ${product1.name}, ${product2.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

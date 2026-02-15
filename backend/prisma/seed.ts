import { PrismaClient, UserRole, ProductCondition } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Mock users and products have been removed for security reasons.
    // See DELETED_LOGINS.md for details on what was removed.
    console.log('Seed data has been removed. No mock users or products will be created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

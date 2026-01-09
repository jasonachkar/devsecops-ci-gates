import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Database seed script
 * Creates initial data for development and testing
 */
async function main() {
    console.log('🌱 Seeding database...');
    // Create a test repository
    const repository = await prisma.repository.upsert({
        where: {
            name_provider: {
                name: 'devsecops-ci-cd-gates',
                provider: 'github',
            },
        },
        update: {},
        create: {
            name: 'devsecops-ci-cd-gates',
            url: 'https://github.com/your-org/devsecops-ci-cd-gates',
            provider: 'github',
            description: 'DevSecOps Security Gates Reference Implementation',
            isActive: true,
        },
    });
    console.log('✅ Created repository:', repository.name);
    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            isActive: true,
        },
    });
    console.log('✅ Created user:', user.email);
    // Create an API key for CI/CD
    const apiKey = await prisma.apiKey.upsert({
        where: { key: 'test-api-key-for-cicd' },
        update: {},
        create: {
            key: 'test-api-key-for-cicd',
            name: 'CI/CD Integration Key',
            repositoryId: repository.id,
            isActive: true,
        },
    });
    console.log('✅ Created API key:', apiKey.name);
    console.log('✨ Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

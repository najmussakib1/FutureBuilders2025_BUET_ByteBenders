const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    try {
        const count = await prisma.medicalAlert.count();
        console.log(`Total Alerts: ${count}`);

        const alerts = await prisma.medicalAlert.findMany({ select: { id: true } });
        console.log('Existing IDs:', alerts.map(a => a.id));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

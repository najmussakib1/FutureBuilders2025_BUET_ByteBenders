const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.medicalAlert.count();
    console.log(`Total Alerts: ${count}`);

    const alerts = await prisma.medicalAlert.findMany({ select: { id: true } });
    console.log('Existing IDs:', alerts.map(a => a.id));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

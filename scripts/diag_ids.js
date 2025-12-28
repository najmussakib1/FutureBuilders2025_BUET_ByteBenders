const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const alertId = 'cmjp9t6dn000bi5uxxqob0v52'; // The ID I gave the user
    const alert = await prisma.medicalAlert.findUnique({
        where: { id: alertId },
        include: { doctor: true }
    });

    if (alert) {
        console.log('Alert Found:');
        console.log('ID:', alert.id);
        console.log('Status:', alert.status);
        console.log('Assigned Doctor ID:', alert.doctorId);
        console.log('Assigned Doctor Email:', alert.doctor?.email);
    } else {
        console.log('Alert not found with ID:', alertId);
    }

    const doctors = await prisma.doctor.findMany({ select: { id: true, email: true } });
    console.log('All Doctors:', doctors);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

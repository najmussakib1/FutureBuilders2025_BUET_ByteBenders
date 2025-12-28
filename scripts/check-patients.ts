import { prisma } from '../src/lib/prisma';

async function main() {
    const patients = await prisma.patient.findMany({
        select: { id: true, name: true, patientId: true }
    });
    console.log('Total patients:', patients.length);
    patients.forEach(p => console.log(`${p.name} (${p.patientId}): ${p.id}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function testDispatch() {
    console.log('🧪 Testing Nearest Ambulance Dispatch Logic...');

    // 1. Get a patient with coordinates
    const patient = await prisma.patient.findFirst({
        where: { lat: { not: null } }
    });

    if (!patient) {
        console.error('❌ No patient with coordinates found. Run seed first.');
        return;
    }

    console.log(`📍 Patient Location: ${patient.lat}, ${patient.lng} (${patient.name})`);

    // 2. Get all available ambulances
    const ambulances = await prisma.ambulance.findMany({
        where: { available: true }
    });

    if (ambulances.length === 0) {
        console.error('❌ No available ambulances found.');
        return;
    }

    // 3. Calculate distances
    const sorted = ambulances.map(a => {
        const dist = Math.sqrt(Math.pow(a.lat - patient.lat, 2) + Math.pow(a.lng - patient.lng, 2));
        return { ...a, dist };
    }).sort((a, b) => a.dist - b.dist);

    console.log('\n🚑 Available Ambulances (Sorted by Proximity):');
    sorted.forEach((a, i) => {
        console.log(`${i + 1}. ${a.driverName} (${a.vehicleNumber}) - Dist: ${a.dist.toFixed(4)} - Loc: ${a.lat}, ${a.lng}`);
    });

    console.log(`\n✅ Nearest Unit: ${sorted[0].driverName} (${sorted[0].vehicleNumber})`);
}

testDispatch()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

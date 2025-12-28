const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Create sample doctors
    const doctors = await Promise.all([
        prisma.doctor.create({
            data: {
                name: 'Dr. Sarah Johnson',
                specialization: 'General Physician',
                phone: '+1234567890',
                email: 'sarah.johnson@hospital.com',
                hospital: 'Rural Health Center',
                available: true,
            },
        }),
        prisma.doctor.create({
            data: {
                name: 'Dr. Michael Chen',
                specialization: 'Cardiologist',
                phone: '+1234567891',
                email: 'michael.chen@hospital.com',
                hospital: 'District Hospital',
                available: true,
            },
        }),
        prisma.doctor.create({
            data: {
                name: 'Dr. Priya Sharma',
                specialization: 'Pediatrician',
                phone: '+1234567892',
                email: 'priya.sharma@hospital.com',
                hospital: 'Community Clinic',
                available: true,
            },
        }),
    ]);

    console.log('✅ Created', doctors.length, 'doctors');

    // Create sample ambulances
    const ambulances = await Promise.all([
        prisma.ambulance.create({
            data: {
                vehicleNumber: 'AMB-001',
                driverName: 'John Smith',
                driverPhone: '+1234567893',
                location: 'Main Station',
                available: true,
            },
        }),
        prisma.ambulance.create({
            data: {
                vehicleNumber: 'AMB-002',
                driverName: 'David Brown',
                driverPhone: '+1234567894',
                location: 'North Station',
                available: true,
            },
        }),
    ]);

    console.log('✅ Created', ambulances.length, 'ambulances');

    // Create sample community worker
    const hashedPassword = await bcrypt.hash('password123', 10);
    const worker = await prisma.communityWorker.create({
        data: {
            email: 'worker@healthcare.com',
            name: 'Maria Garcia',
            phone: '+1234567895',
            password: hashedPassword,
            village: 'Greenfield',
            assignedArea: 'North District',
        },
    });

    console.log('✅ Created community worker:', worker.email);
    console.log('   Password: password123');

    // Create sample patients
    const patients = await Promise.all([
        prisma.patient.create({
            data: {
                patientId: 'P-0001',
                name: 'Robert Williams',
                age: 45,
                gender: 'Male',
                phone: '+1234567896',
                address: '123 Main Street',
                village: 'Greenfield',
                bloodGroup: 'O+',
                allergies: JSON.stringify(['Penicillin']),
                chronicDiseases: JSON.stringify(['Hypertension']),
                workerId: worker.id,
            },
        }),
        prisma.patient.create({
            data: {
                patientId: 'P-0002',
                name: 'Emily Davis',
                age: 32,
                gender: 'Female',
                phone: '+1234567897',
                address: '456 Oak Avenue',
                village: 'Greenfield',
                bloodGroup: 'A+',
                allergies: JSON.stringify([]),
                chronicDiseases: JSON.stringify(['Diabetes Type 2']),
                workerId: worker.id,
            },
        }),
        prisma.patient.create({
            data: {
                patientId: 'P-0003',
                name: 'James Miller',
                age: 67,
                gender: 'Male',
                phone: '+1234567898',
                address: '789 Pine Road',
                village: 'Greenfield',
                bloodGroup: 'B+',
                allergies: JSON.stringify(['Sulfa drugs']),
                chronicDiseases: JSON.stringify(['Arthritis', 'High Cholesterol']),
                workerId: worker.id,
            },
        }),
    ]);

    console.log('✅ Created', patients.length, 'patients');

    // Create sample medical records
    await prisma.medicalRecord.create({
        data: {
            patientId: patients[0].id,
            diagnosis: 'Seasonal Flu',
            symptoms: JSON.stringify(['Fever', 'Cough', 'Body Ache']),
            treatment: 'Rest and hydration, antipyretics',
            medications: JSON.stringify(['Paracetamol 500mg', 'Cough syrup']),
            notes: 'Patient advised to rest for 3-4 days',
            visitDate: new Date('2024-12-20'),
        },
    });

    await prisma.medicalRecord.create({
        data: {
            patientId: patients[1].id,
            diagnosis: 'Diabetes Follow-up',
            symptoms: JSON.stringify(['Fatigue', 'Increased thirst']),
            treatment: 'Medication adjustment',
            medications: JSON.stringify(['Metformin 500mg twice daily']),
            notes: 'Blood sugar levels improving',
            visitDate: new Date('2024-12-15'),
        },
    });

    console.log('✅ Created sample medical records');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: worker@healthcare.com');
    console.log('   Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

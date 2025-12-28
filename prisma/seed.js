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

    // Clear existing data
    await prisma.caseNote.deleteMany();
    await prisma.emergencyResponse.deleteMany();
    await prisma.riskAssessment.deleteMany();
    await prisma.medicalAlert.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.ambulance.deleteMany();
    await prisma.communityWorker.deleteMany();

    console.log('🧹 Cleared existing data');

    // Create sample doctors
    // Create sample doctors
    const hashedPassword = await bcrypt.hash('password123', 10);

    const doctors = await Promise.all([
        prisma.doctor.create({
            data: {
                id: 'dr-sarah',
                name: 'Dr. Sarah Johnson',
                specialization: 'General Physician',
                phone: '+1234567890',
                email: 'sarah.johnson@hospital.com',
                password: hashedPassword,
                hospital: 'Rural Health Center',
                area: 'North District',
                lat: 23.8103,
                lng: 90.4125,
                experienceYears: 10,
                status: 'ACTIVE',
                available: true,
            },
        }),
        prisma.doctor.create({
            data: {
                id: 'dr-michael',
                name: 'Dr. Michael Chen',
                specialization: 'Cardiologist',
                phone: '+1234567891',
                email: 'michael.chen@hospital.com',
                password: hashedPassword,
                hospital: 'District Hospital',
                area: 'South District',
                lat: 23.7561,
                lng: 90.3872,
                experienceYears: 15,
                status: 'ACTIVE',
                available: true,
            },
        }),
        prisma.doctor.create({
            data: {
                id: 'dr-priya',
                name: 'Dr. Priya Sharma',
                specialization: 'Pediatrician',
                phone: '+1234567892',
                email: 'priya.sharma@hospital.com',
                password: hashedPassword,
                hospital: 'Community Clinic',
                area: 'East District',
                lat: 23.7941,
                lng: 90.4043,
                experienceYears: 5,
                status: 'BUSY',
                available: false,
            },
        }),
    ]);

    console.log('✅ Created', doctors.length, 'doctors');

    // Create sample ambulances
    const ambulances = await Promise.all([
        prisma.ambulance.create({
            data: {
                id: 'amb-1',
                vehicleNumber: 'AMB-001',
                driverName: 'John Smith',
                driverPhone: '+1234567893',
                email: 'driver1@ambulance.com',
                password: hashedPassword,
                location: 'Main Station',
                lat: 23.8103,
                lng: 90.4125,
                available: true,
            },
        }),
        prisma.ambulance.create({
            data: {
                id: 'amb-2',
                vehicleNumber: 'AMB-002',
                driverName: 'David Brown',
                driverPhone: '+1234567894',
                email: 'driver2@ambulance.com',
                password: hashedPassword,
                location: 'North Station',
                lat: 23.8321,
                lng: 90.4215,
                available: true,
            },
        }),
    ]);

    console.log('✅ Created', ambulances.length, 'ambulances');

    // Create sample community worker
    // Reusing hashedPassword from above
    const worker = await prisma.communityWorker.create({
        data: {
            id: 'worker-1',
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
                id: 'patient-1',
                patientId: 'P-0001',
                name: 'Robert Williams',
                age: 45,
                gender: 'Male',
                phone: '+1234567896',
                address: '123 Main Street',
                village: 'Greenfield',
                lat: 23.8215,
                lng: 90.4182,
                bloodGroup: 'O+',
                allergies: JSON.stringify(['Penicillin']),
                chronicDiseases: JSON.stringify(['Hypertension']),
                workerId: worker.id,
            },
        }),
        prisma.patient.create({
            data: {
                id: 'patient-2',
                patientId: 'P-0002',
                name: 'Emily Davis',
                age: 32,
                gender: 'Female',
                phone: '+1234567897',
                address: '456 Oak Avenue',
                village: 'Greenfield',
                lat: 23.8152,
                lng: 90.4091,
                bloodGroup: 'A+',
                allergies: JSON.stringify([]),
                chronicDiseases: JSON.stringify(['Diabetes Type 2']),
                workerId: worker.id,
            },
        }),
        prisma.patient.create({
            data: {
                id: 'patient-3',
                patientId: 'P-0003',
                name: 'James Miller',
                age: 67,
                gender: 'Male',
                phone: '+1234567898',
                address: '789 Pine Road',
                village: 'Greenfield',
                lat: 23.8190,
                lng: 90.4150,
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

    // Create a sample ESCALATED alert for testing
    const alert = await prisma.medicalAlert.create({
        data: {
            id: 'test-escalated-alert',
            patientId: patients[0].id,
            workerId: worker.id,
            doctorId: doctors[0].id, // Dr. Sarah Johnson
            symptoms: JSON.stringify(['Chest Pain', 'Shortness of Breath']),
            severity: 'SEVERE',
            vitalSigns: JSON.stringify({ bp: '160/95', hr: '110', temp: '99.5F' }),
            primaryTreatment: 'Administered Aspirin 325mg',
            status: 'ESCALATED',
        }
    });

    // Valid risk assessment for the alert
    await prisma.riskAssessment.create({
        data: {
            alertId: alert.id,
            riskLevel: 'HIGH',
            aiAnalysis: 'Symptoms suggest potential Acute Coronary Syndrome.',
            primaryCareAdvice: 'Immediate transport required.',
            requiresSpecialist: true,
            estimatedSeverity: 9,
            emergencyResponse: {
                create: {
                    status: 'INITIATED',
                    responseType: 'AMBULANCE_DISPATCH',
                    doctorAssigned: true,
                    doctorId: doctors[0].id
                }
            }
        }
    });

    console.log('✅ Created sample ESCALATED alert:', alert.id);

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

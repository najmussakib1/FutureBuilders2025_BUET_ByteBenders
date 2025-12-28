'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function searchPatients(query: string, workerId: string) {
    try {
        const patients = await prisma.patient.findMany({
            where: {
                workerId,
                OR: [
                    { patientId: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } },
                ],
            },
            include: {
                medicalRecords: {
                    orderBy: { visitDate: 'desc' },
                    take: 3,
                },
                medicalAlerts: {
                    where: { status: 'PENDING' },
                    take: 1,
                },
            },
            take: 10,
        });

        return { success: true, patients };
    } catch (error) {
        console.error('Search patients error:', error);
        return { success: false, error: 'Failed to search patients' };
    }
}

export async function getPatientById(patientId: string) {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                worker: {
                    select: {
                        name: true,
                        phone: true,
                        village: true,
                    },
                },
                medicalRecords: {
                    orderBy: { visitDate: 'desc' },
                },
                medicalAlerts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        riskAssessment: {
                            include: {
                                emergencyResponse: {
                                    include: {
                                        doctor: true,
                                        ambulance: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!patient) {
            return { success: false, error: 'Patient not found' };
        }

        return { success: true, patient };
    } catch (error) {
        console.error('Get patient error:', error);
        return { success: false, error: 'Failed to fetch patient' };
    }
}

export async function createPatient(data: {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    address: string;
    village: string;
    bloodGroup?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    workerId: string;
    lat?: number;
    lng?: number;
}) {
    try {
        // Generate patient ID
        const count = await prisma.patient.count();
        const patientId = `P-${String(count + 1).padStart(4, '0')}`;

        const patient = await prisma.patient.create({
            data: {
                patientId,
                name: data.name,
                age: data.age,
                gender: data.gender,
                phone: data.phone,
                address: data.address,
                village: data.village,
                bloodGroup: data.bloodGroup,
                allergies: data.allergies ? JSON.stringify(data.allergies) : null,
                chronicDiseases: data.chronicDiseases ? JSON.stringify(data.chronicDiseases) : null,
                workerId: data.workerId,
                lat: data.lat,
                lng: data.lng,
            },
        });

        revalidatePath('/dashboard');
        return { success: true, patient };
    } catch (error) {
        console.error('Create patient error:', error);
        return { success: false, error: 'Failed to create patient' };
    }
}

export async function addMedicalRecord(data: {
    patientId: string;
    diagnosis: string;
    symptoms: string[];
    treatment: string;
    medications?: string[];
    notes?: string;
}) {
    try {
        const record = await prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                diagnosis: data.diagnosis,
                symptoms: JSON.stringify(data.symptoms),
                treatment: data.treatment,
                medications: data.medications ? JSON.stringify(data.medications) : null,
                notes: data.notes,
            },
        });

        revalidatePath(`/patient/${data.patientId}`);
        return { success: true, record };
    } catch (error) {
        console.error('Add medical record error:', error);
        return { success: false, error: 'Failed to add medical record' };
    }
}

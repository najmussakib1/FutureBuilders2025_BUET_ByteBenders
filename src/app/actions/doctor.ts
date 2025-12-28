'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDoctorAlerts(doctorId: string) {
    try {
        const alerts = await db.medicalAlert.findMany({
            where: {
                doctorId: doctorId,
                status: 'ESCALATED'
            },
            include: {
                patient: true,
                riskAssessment: true,
            },
            orderBy: {
                severity: 'desc' // Severe cases first
            }
        });
        return { success: true, alerts };
    } catch (error) {
        console.error('Error fetching doctor alerts:', error);
        return { success: false, alerts: [] };
    }
}
export async function getDoctorData(doctorId: string) {
    try {
        const doctor = await db.doctor.findUnique({
            where: { id: doctorId }
        });
        return { success: true, doctor };
    } catch (error) {
        console.error('Error fetching doctor data:', error);
        return { success: false, error: 'Failed to fetch doctor' };
    }
}

export async function updateDoctorLocation(doctorId: string, lat: number, lng: number) {
    try {
        console.log('--- DOCTOR LOCATION UPDATE START ---');
        console.log('ID:', doctorId);
        console.log('COORDS:', { lat, lng });

        const updated = await db.doctor.update({
            where: { id: doctorId },
            data: { lat, lng }
        });

        console.log('UPDATE SUCCESSFUL:', updated.id);

        revalidatePath('/doctor/profile');
        revalidatePath('/doctor/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('--- DOCTOR LOCATION UPDATE ERROR ---');
        console.error(error);
        return { success: false, error: error.message || 'Failed to update location' };
    }
}

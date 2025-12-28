'use server';

import { prisma } from '@/lib/prisma';

export async function getDoctorAlerts(doctorId: string) {
    try {
        const alerts = await prisma.medicalAlert.findMany({
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
        const doctor = await prisma.doctor.findUnique({
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
        await (prisma.doctor as any).update({
            where: { id: doctorId },
            data: { lat, lng }
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating doctor location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

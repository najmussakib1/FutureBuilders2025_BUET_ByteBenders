'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { RiskAssessment } from '@/lib/ai/types';

export async function createAlert(data: {
    patientId: string;
    workerId: string;
    symptoms: string[];
    severity: string;
    vitalSigns: any;
    description?: string;
}) {
    try {
        const alert = await prisma.medicalAlert.create({
            data: {
                patientId: data.patientId,
                workerId: data.workerId,
                symptoms: JSON.stringify(data.symptoms),
                severity: data.severity,
                vitalSigns: JSON.stringify(data.vitalSigns),
                description: data.description,
                status: 'PENDING',
            },
        });

        // Trigger AI Assessment (Mock for now, or call Groq)
        // In a real app, this might be a background job
        await generateRiskAssessment(alert.id, data);

        revalidatePath(`/patient/${data.patientId}`);
        revalidatePath('/dashboard');
        return { success: true, alert };
    } catch (error) {
        console.error('Create alert error:', error);
        return { success: false, error: 'Failed to create alert' };
    }
}

async function generateRiskAssessment(alertId: string, data: any) {
    // Placeholder for AI Logic - can be connected to Groq later if needed immediately
    // For now, we create a dummy assessment to unblock the UI flow
    await prisma.riskAssessment.create({
        data: {
            alertId,
            riskLevel: data.severity === 'SEVERE' ? 'HIGH' : 'MEDIUM',
            aiAnalysis: 'AI Analysis indicates potential complications based on reported symptoms.',
            primaryCareAdvice: 'Monitor vitals every hour. Administer fluids if dehydrated.',
            requiresSpecialist: data.severity === 'SEVERE',
            estimatedSeverity: data.severity === 'SEVERE' ? 8 : 5,
        }
    });
}

export async function getAlertWithAssessment(alertId: string) {
    try {
        const alert = await prisma.medicalAlert.findUnique({
            where: { id: alertId },
            include: {
                patient: true,
                riskAssessment: {
                    include: {
                        emergencyResponse: true,
                    },
                },
                doctor: true, // Include assigned doctor
            },
        });

        if (!alert) return { success: false, error: 'Alert not found' };

        return { success: true, alert };
    } catch (error) {
        console.error('Get alert error:', error);
        return { success: false, error: 'Failed to fetch alert' };
    }
}

export async function submitPrimaryTreatment(alertId: string, treatment: string) {
    try {
        const alert = await prisma.medicalAlert.update({
            where: { id: alertId },
            data: {
                primaryTreatment: treatment,
                status: 'ASSESSED',
            },
        });
        revalidatePath(`/alert/${alertId}`);
        return { success: true, alert };
    } catch (error) {
        console.error('Primary treatment error:', error);
        return { success: false, error: 'Failed to submit treatment' };
    }
}

export async function escalateToDoctor(alertId: string, doctorId: string) {
    try {
        const alert = await prisma.medicalAlert.update({
            where: { id: alertId },
            data: {
                doctorId: doctorId,
                status: 'ESCALATED',
            },
        });
        revalidatePath(`/alert/${alertId}`);
        return { success: true, alert };
    } catch (error) {
        console.error('Escalation error:', error);
        return { success: false, error: 'Failed to escalate to doctor' };
    }
}

export async function getAvailableDoctors() {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { available: true }
        });
        return { success: true, doctors };
    } catch (error) {
        return { success: false, doctors: [] };
    }
}

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Assessment } from '@/lib/ai/types';
import { generateResolutionSummary } from '@/lib/ai/risk-assessment';

export async function createAlert(data: {
    patientId: string;
    workerId: string;
    symptoms: string[];
    severity: string;
    vitalSigns: any;
    description?: string;
}) {
    try {
        const alert = await db.medicalAlert.create({
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

        // Trigger AI Assessment
        await generateRiskAssessment(alert.id, data);

        // Auto-assign doctor if severity is high or moderate
        if (data.severity === 'SEVERE' || data.severity === 'MODERATE') {
            await autoAssignDoctor(alert.id, data.workerId);
        }

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
    await db.riskAssessment.create({
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
        const alert = await db.medicalAlert.findUnique({
            where: { id: alertId },
            include: {
                patient: true,
                worker: true, // Include creator worker
                caseNotes: {
                    include: {
                        worker: true,
                        doctor: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                riskAssessment: {
                    include: {
                        emergencyResponse: {
                            include: {
                                doctor: true,
                                ambulance: true
                            }
                        },
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

async function autoAssignDoctor(alertId: string, workerId: string) {
    try {
        // 1. Get worker's assigned area
        const worker = await db.communityWorker.findUnique({
            where: { id: workerId },
            select: { assignedArea: true }
        });

        if (!worker) return null;

        // 2. Find best available doctor in the same area
        let doctor = await db.doctor.findFirst({
            where: {
                available: true,
                area: worker.assignedArea,
                status: 'ACTIVE'
            },
            orderBy: { experienceYears: 'desc' }
        });

        // 3. Fallback: Find any available doctor
        if (!doctor) {
            doctor = await db.doctor.findFirst({
                where: {
                    available: true,
                    status: 'ACTIVE'
                },
                orderBy: { experienceYears: 'desc' }
            });
        }

        if (doctor) {
            await db.medicalAlert.update({
                where: { id: alertId },
                data: {
                    doctorId: doctor.id,
                    status: 'ESCALATED'
                }
            });
            return doctor;
        }
        return null;
    } catch (error) {
        console.error('Auto-assign error:', error);
        return null;
    }
}

export async function submitPrimaryTreatment(alertId: string, treatment: string) {
    try {
        const currentAlert = await db.medicalAlert.findUnique({
            where: { id: alertId },
            select: { status: true }
        });

        const alert = await db.medicalAlert.update({
            where: { id: alertId },
            data: {
                primaryTreatment: treatment,
                status: currentAlert?.status === 'PENDING' ? 'ASSESSED' : currentAlert?.status
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
        const alert = await db.medicalAlert.update({
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

export async function getRecommendedDoctors(workerId: string) {
    try {
        // 1. Get the worker's assigned area
        const worker = await db.communityWorker.findUnique({
            where: { id: workerId },
            select: { assignedArea: true }
        });

        if (!worker) return { success: false, doctors: [] };

        // 2. Find doctors in the same area (Priority 1)
        const areaDoctors = await db.doctor.findMany({
            where: {
                available: true,
                area: worker.assignedArea
            },
            orderBy: { experienceYears: 'desc' }
        });

        // 3. Find other available doctors (Priority 2)
        // Only if we need more options, or just return them as separate list
        const otherDoctors = await db.doctor.findMany({
            where: {
                available: true,
                area: { not: worker.assignedArea || '' }
            },
            orderBy: { experienceYears: 'desc' },
            take: 5
        });

        return {
            success: true,
            doctors: [...areaDoctors, ...otherDoctors],
            recommendedCount: areaDoctors.length
        };
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return { success: false, doctors: [] };
    }
}

export async function resolveAlert(alertId: string, notes: string, doctorId: string) {
    try {
        console.log('Resolving alert:', { alertId, doctorId });

        // 1. Get the alert with its risk assessment ID
        const alertCheck = await db.medicalAlert.findUnique({
            where: { id: alertId },
            include: { riskAssessment: true }
        });

        if (!alertCheck) return { success: false, error: 'Alert not found' };

        // 2. Perform the update
        const updatedAlert = await db.medicalAlert.update({
            where: { id: alertId },
            data: {
                status: 'RESOLVED',
                riskAssessment: {
                    update: {
                        emergencyResponse: {
                            upsert: {
                                create: {
                                    status: 'COMPLETED',
                                    notes: notes,
                                    responseType: 'DOCTOR_CONSULT' // Default for resolved cases
                                },
                                update: {
                                    status: 'COMPLETED',
                                    notes: notes
                                }
                            }
                        }
                    }
                }
            },
            include: {
                riskAssessment: true,
                patient: true
            }
        });

        // 3. Generate AI Summary for Medical Record
        if (updatedAlert.riskAssessment) {
            const symptoms = JSON.parse(updatedAlert.symptoms);
            const aiSummary = await generateResolutionSummary(
                {
                    symptoms,
                    aiAnalysis: updatedAlert.riskAssessment.aiAnalysis
                },
                notes
            );

            // 4. Create permanent Medical Record
            await db.medicalRecord.create({
                data: {
                    patientId: updatedAlert.patientId,
                    diagnosis: aiSummary.diagnosis,
                    treatment: aiSummary.treatment,
                    notes: aiSummary.notes,
                    symptoms: updatedAlert.symptoms, // Keep original symptoms
                }
            });
        }

        revalidatePath(`/alert/${alertId}`);
        revalidatePath(`/doctor/alert/${alertId}`);
        revalidatePath(`/patient/${updatedAlert.patientId}`);
        revalidatePath('/doctor/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Resolve error:', error);
        return { success: false, error: 'Failed to resolve alert' };
    }
}

export async function addCaseNote(alertId: string, content: string, type: 'INSTRUCTION' | 'UPDATE', authorId: string) {
    try {
        console.log('Backend: addCaseNote', { alertId, type, authorId });
        const data: any = {
            alertId,
            content,
            type,
        };

        if (type === 'INSTRUCTION') {
            data.doctorId = authorId;
        } else {
            data.workerId = authorId;
        }

        const note = await db.caseNote.create({
            data,
            include: {
                worker: true,
                doctor: true
            }
        });

        revalidatePath(`/alert/${alertId}`);
        revalidatePath(`/doctor/alert/${alertId}`);
        return { success: true, note };
    } catch (error) {
        console.error('Add note error:', error);
        return { success: false, error: 'Failed to add note' };
    }
}

export async function getCaseNotes(alertId: string) {
    try {
        const notes = await db.caseNote.findMany({
            where: { alertId },
            include: {
                worker: true,
                doctor: true
            },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, notes };
    } catch (error) {
        console.error('Get notes error:', error);
        return { success: false, notes: [] };
    }
}
export async function getDoctorAlerts(doctorId: string) {
    try {
        const alerts = await db.medicalAlert.findMany({
            where: {
                doctorId: doctorId,
                status: 'ESCALATED'
            },
            include: {
                patient: true,
                worker: true,
                riskAssessment: {
                    include: {
                        emergencyResponse: {
                            include: {
                                ambulance: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, alerts };
    } catch (error) {
        console.error('Error fetching doctor alerts:', error);
        return { success: false, alerts: [] };
    }
}

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function dispatchAmbulance(alertId: string, doctorId: string) {
    try {
        // 1. Get the alert and its assessment
        const alert = await prisma.medicalAlert.findUnique({
            where: { id: alertId },
            include: {
                riskAssessment: true,
                patient: true
            }
        });

        if (!alert || !alert.riskAssessment) {
            return { success: false, error: 'Alert assessment not found' };
        }

        // 2. Find the nearest available ambulance
        // In a real app, we'd use GIS queries. Here we use a proximity sort if lat/lng exists.
        const ambulances = await prisma.ambulance.findMany({
            where: { available: true }
        });

        if (ambulances.length === 0) {
            return { success: false, error: 'No ambulances available currently' };
        }

        let selectedAmbulance = ambulances[0];
        const p = alert.patient as any;
        if (p.lat && p.lng) {
            // Simple Euclidean distance for mock sorting
            selectedAmbulance = ambulances.sort((a: any, b: any) => {
                const distA = Math.sqrt(Math.pow(a.lat! - p.lat!, 2) + Math.pow(a.lng! - p.lng!, 2));
                const distB = Math.sqrt(Math.pow(b.lat! - p.lat!, 2) + Math.pow(b.lng! - p.lng!, 2));
                return distA - distB;
            })[0];
        }

        // 3. Create or Update Emergency Response
        await prisma.emergencyResponse.upsert({
            where: { assessmentId: alert.riskAssessment.id },
            create: {
                assessmentId: alert.riskAssessment.id,
                responseType: 'AMBULANCE_DISPATCH',
                ambulanceDispatched: true,
                ambulanceId: selectedAmbulance.id,
                status: 'INITIATED',
                notes: `Ambulance ${selectedAmbulance.vehicleNumber} dispatched by doctor.`
            },
            update: {
                responseType: 'AMBULANCE_DISPATCH',
                ambulanceDispatched: true,
                ambulanceId: selectedAmbulance.id,
                status: 'INITIATED',
                notes: `Ambulance ${selectedAmbulance.vehicleNumber} dispatched by doctor.`
            }
        });

        // 4. Update ambulance status
        await prisma.ambulance.update({
            where: { id: selectedAmbulance.id },
            data: { available: false }
        });

        revalidatePath(`/doctor/alert/${alertId}`);
        revalidatePath('/ambulance/dashboard');

        return {
            success: true,
            ambulance: {
                name: selectedAmbulance.driverName,
                vehicle: selectedAmbulance.vehicleNumber,
                phone: selectedAmbulance.driverPhone
            }
        };
    } catch (error) {
        console.error('Dispatch error:', error);
        return { success: false, error: 'Internal server error during dispatch' };
    }
}
export async function getAmbulanceTasks(ambulanceId: string) {
    try {
        const responses = await prisma.emergencyResponse.findMany({
            where: {
                ambulanceId: ambulanceId,
                status: { in: ['INITIATED', 'IN_PROGRESS', 'PICKED_UP'] }
            },
            include: {
                assessment: {
                    include: {
                        alert: {
                            include: {
                                patient: true,
                                worker: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, tasks: responses };
    } catch (error) {
        console.error('Error fetching ambulance tasks:', error);
        return { success: false, error: 'Failed to fetch tasks' };
    }
}

export async function getAmbulanceHistory(ambulanceId: string) {
    try {
        const history = await prisma.emergencyResponse.findMany({
            where: {
                ambulanceId: ambulanceId,
                status: 'COMPLETED'
            },
            include: {
                assessment: {
                    include: {
                        alert: {
                            include: {
                                patient: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });
        return { success: true, history };
    } catch (error) {
        console.error('Error fetching history:', error);
        return { success: false, history: [] };
    }
}

export async function updateTaskStatus(responseId: string, status: string, notes?: string) {
    try {
        const response = await prisma.emergencyResponse.update({
            where: { id: responseId },
            data: {
                status: status as any,
                notes: notes
            },
            include: {
                assessment: {
                    select: { alertId: true }
                }
            }
        });

        // If completed, make ambulance available again
        if (status === 'COMPLETED') {
            await prisma.ambulance.update({
                where: { id: response.ambulanceId! },
                data: { available: true }
            });
        }

        revalidatePath(`/doctor/alert/${response.assessment.alertId}`);
        revalidatePath('/ambulance/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating task status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function updateAmbulanceLocation(ambulanceId: string, lat: number, lng: number) {
    try {
        await (prisma.ambulance as any).update({
            where: { id: ambulanceId },
            data: { lat, lng }
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating ambulance location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

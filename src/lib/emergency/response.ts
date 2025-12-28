import { db } from '@/lib/prisma';
import { RiskLevel } from '@/lib/ai/risk-assessment';

export type ResponseType = 'ADVICE_ONLY' | 'DOCTOR_CONSULT' | 'EMERGENCY_DOCTOR' | 'AMBULANCE_DISPATCH';

export interface EmergencyResponseResult {
    responseType: ResponseType;
    doctorAssigned: boolean;
    doctorInfo?: {
        id: string;
        name: string;
        specialization: string;
        phone: string;
    };
    ambulanceDispatched: boolean;
    ambulanceInfo?: {
        id: string;
        vehicleNumber: string;
        driverName: string;
        driverPhone: string;
    };
    message: string;
}

export async function orchestrateEmergencyResponse(
    riskLevel: RiskLevel,
    assessmentId: string,
    specialistType?: string
): Promise<EmergencyResponseResult> {
    let responseType: ResponseType;
    let doctorAssigned = false;
    let ambulanceDispatched = false;
    let doctorInfo;
    let ambulanceInfo;
    let message = '';

    switch (riskLevel) {
        case 'LOW':
            responseType = 'DOCTOR_CONSULT';
            // Assign available doctor for routine consultation
            const doctor = await findAvailableDoctor(specialistType);
            if (doctor) {
                doctorAssigned = true;
                doctorInfo = doctor;
                message = `Low risk case. Doctor ${doctor.name} has been assigned for consultation. Patient should schedule an appointment.`;
            } else {
                message = 'Low risk case. Please arrange doctor consultation at earliest convenience.';
            }
            break;

        case 'MEDIUM':
            responseType = 'EMERGENCY_DOCTOR';
            // Assign doctor with emergency notification
            const emergencyDoc = await findAvailableDoctor(specialistType);
            if (emergencyDoc) {
                doctorAssigned = true;
                doctorInfo = emergencyDoc;
                message = `URGENT: Medium risk case. Dr. ${emergencyDoc.name} has been notified for emergency consultation. Contact immediately at ${emergencyDoc.phone}.`;
            } else {
                message = 'URGENT: Medium risk case. Attempting to contact available medical personnel.';
            }
            break;

        case 'HIGH':
            responseType = 'AMBULANCE_DISPATCH';
            // Auto-dispatch ambulance and assign doctor
            const [criticalDoc, ambulance] = await Promise.all([
                findAvailableDoctor(specialistType),
                findAvailableAmbulance(),
            ]);

            if (criticalDoc) {
                doctorAssigned = true;
                doctorInfo = criticalDoc;
            }

            if (ambulance) {
                ambulanceDispatched = true;
                ambulanceInfo = ambulance;
                // Mark ambulance as unavailable
                await db.ambulance.update({
                    where: { id: ambulance.id },
                    data: { available: false },
                });
            }

            message = `🚨 CRITICAL: High risk emergency! ${ambulanceDispatched
                    ? `Ambulance ${ambulanceInfo!.vehicleNumber} dispatched. Driver: ${ambulanceInfo!.driverName} (${ambulanceInfo!.driverPhone}).`
                    : 'Ambulance dispatch in progress.'
                } ${doctorAssigned
                    ? `Dr. ${doctorInfo!.name} alerted.`
                    : 'Medical team being contacted.'
                } Keep patient stable and monitor vital signs.`;
            break;

        default:
            responseType = 'ADVICE_ONLY';
            message = 'Assessment complete. Follow primary care advice provided.';
    }

    // Create emergency response record
    await db.emergencyResponse.create({
        data: {
            assessmentId,
            responseType,
            doctorAssigned,
            doctorId: doctorInfo?.id,
            ambulanceDispatched,
            ambulanceId: ambulanceInfo?.id,
            status: 'INITIATED',
            notes: message,
        },
    });

    return {
        responseType,
        doctorAssigned,
        doctorInfo,
        ambulanceDispatched,
        ambulanceInfo,
        message,
    };
}

async function findAvailableDoctor(specialization?: string) {
    const doctor = await db.doctor.findFirst({
        where: {
            available: true,
            ...(specialization && { specialization }),
        },
        orderBy: {
            createdAt: 'asc', // First available
        },
    });

    if (!doctor && specialization) {
        // Fallback to any available doctor if specialist not found
        return await db.doctor.findFirst({
            where: { available: true },
        });
    }

    return doctor;
}

async function findAvailableAmbulance() {
    return await db.ambulance.findFirst({
        where: { available: true },
        orderBy: {
            createdAt: 'asc',
        },
    });
}

export async function completeEmergencyResponse(responseId: string) {
    const response = await db.emergencyResponse.update({
        where: { id: responseId },
        data: { status: 'COMPLETED' },
        include: {
            ambulance: true,
            doctor: true,
        },
    });

    // Release resources
    if (response.ambulanceId) {
        await db.ambulance.update({
            where: { id: response.ambulanceId },
            data: { available: true },
        });
    }

    return response;
}

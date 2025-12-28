'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Update the location for a community worker
 */
export async function updateWorkerLocation(workerId: string, lat: number, lng: number) {
    try {
        await prisma.communityWorker.update({
            where: { id: workerId },
            data: {
                lat: lat,
                lng: lng
            } as any
        });

        revalidatePath('/dashboard/profile');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Failed to update worker location:', error);
        return { success: false, error: 'Database update failed' };
    }
}

/**
 * Fetch community worker data with their medical alerts and patients
 */
export async function getWorkerData(workerId: string) {
    try {
        const worker = await prisma.communityWorker.findUnique({
            where: { id: workerId },
            include: {
                patients: true,
                medicalAlerts: true
            }
        });

        if (!worker) return { success: false, error: 'Worker not found' };

        return { success: true, worker };
    } catch (error) {
        console.error('Failed to fetch worker data:', error);
        return { success: false, error: 'Database fetch failed' };
    }
}

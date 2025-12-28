'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerWorker(data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    village: string;
    assignedArea: string;
}) {
    try {
        // Check if email already exists
        const existing = await prisma.communityWorker.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            return { success: false, error: 'Email already registered' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create worker
        const worker = await prisma.communityWorker.create({
            data: {
                email: data.email,
                name: data.name,
                phone: data.phone,
                password: hashedPassword,
                village: data.village,
                assignedArea: data.assignedArea,
            },
            select: {
                id: true,
                email: true,
                name: true,
                village: true,
            },
        });

        return { success: true, worker };
    } catch (error) {
        console.error('Register worker error:', error);
        return { success: false, error: 'Failed to register worker' };
    }
}

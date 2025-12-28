import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // 1. Try to find a Community Worker
                const worker = await prisma.communityWorker.findUnique({
                    where: { email: credentials.email },
                });

                if (worker) {
                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        worker.password
                    );
                    if (isValidPassword) {
                        return {
                            id: worker.id,
                            email: worker.email,
                            name: worker.name,
                            role: 'WORKER',
                        };
                    }
                }

                // 2. Try to find a Doctor
                const doctor = await prisma.doctor.findUnique({
                    where: { email: credentials.email },
                });

                if (doctor) {
                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        (doctor as any).password
                    );
                    if (isValidPassword) {
                        return {
                            id: doctor.id,
                            email: doctor.email,
                            name: doctor.name,
                            role: 'DOCTOR',
                        };
                    }
                }

                // 3. Try to find an Ambulance Driver
                const ambulance = await prisma.ambulance.findUnique({
                    where: { email: credentials.email },
                });

                if (ambulance) {
                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        (ambulance as any).password
                    );
                    if (isValidPassword) {
                        return {
                            id: ambulance.id,
                            email: ambulance.email,
                            name: ambulance.driverName,
                            role: 'AMBULANCE',
                        };
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    session: {
        strategy: 'jwt' as const,
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

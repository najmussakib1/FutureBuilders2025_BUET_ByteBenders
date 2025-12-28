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

                const worker = await prisma.communityWorker.findUnique({
                    where: { email: credentials.email },
                });

                if (!worker) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    worker.password
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: worker.id,
                    email: worker.email,
                    name: worker.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
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

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/prisma';
import PatientForm from '@/components/patient/PatientForm';
import Link from 'next/link';

export default async function NewPatientPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const worker = await db.communityWorker.findUnique({
        where: { email: session.user.email! },
    });

    if (!worker) redirect('/');

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between fade-in">
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="card slide-in">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Register New Patient</h1>
                    <PatientForm workerId={worker.id} />
                </div>
            </div>
        </div>
    );
}

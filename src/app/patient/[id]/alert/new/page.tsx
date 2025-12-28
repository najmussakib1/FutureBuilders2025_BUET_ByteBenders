import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/prisma';
import AlertForm from '@/components/alert/AlertForm';
import Link from 'next/link';

export default async function NewAlertPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const worker = await db.communityWorker.findUnique({
        where: { email: session.user.email! },
    });

    if (!worker) redirect('/');

    const patient = await db.patient.findUnique({
        where: { id },
    });

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Patient Not Found</h2>
                    <Link href="/dashboard" className="btn-primary mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between fade-in">
                    <Link href={`/patient/${patient.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Patient
                    </Link>
                </div>

                <div className="card slide-in">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Medical Alert</h1>
                    <p className="text-gray-600 mb-6">
                        Patient: <span className="font-semibold">{patient.name}</span> ({patient.patientId})
                    </p>

                    <AlertForm patientId={patient.id} workerId={worker.id} />
                </div>
            </div>
        </div>
    );
}

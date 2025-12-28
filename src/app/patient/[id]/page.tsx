import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPatientById } from '@/app/actions/patient';
import { FileText, User, Phone, MapPin, Droplet, AlertCircle, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const result = await getPatientById(id);

    if (!result.success || !result.patient) {
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

    const { patient } = result;
    const allergies = patient.allergies ? JSON.parse(patient.allergies) : [];
    const chronicDiseases = patient.chronicDiseases ? JSON.parse(patient.chronicDiseases) : [];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between fade-in">
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Dashboard
                    </Link>
                    <Link
                        href={`/patient/${patient.id}/alert/new`}
                        className="btn-danger flex items-center space-x-2"
                    >
                        <AlertCircle size={20} />
                        <span>Create Medical Alert</span>
                    </Link>
                </div>

                {/* Patient Info Card */}
                <div className="card slide-in">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                                {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{patient.name}</h1>
                                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {patient.patientId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <User className="text-blue-600" size={20} />
                            <div>
                                <p className="text-sm text-gray-600">Age & Gender</p>
                                <p className="font-semibold text-gray-800">{patient.age} years • {patient.gender}</p>
                            </div>
                        </div>

                        {patient.phone && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="text-green-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold text-gray-800">{patient.phone}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="text-red-600" size={20} />
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-semibold text-gray-800">{patient.village}</p>
                            </div>
                        </div>

                        {patient.bloodGroup && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Droplet className="text-red-600" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Blood Group</p>
                                    <p className="font-semibold text-gray-800">{patient.bloodGroup}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {(allergies.length > 0 || chronicDiseases.length > 0) && (
                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allergies.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Allergies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allergies.map((allergy: string, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {chronicDiseases.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Chronic Diseases</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {chronicDiseases.map((disease: string, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                                {disease}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Medical History */}
                <div className="card slide-in">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <FileText className="mr-2 text-blue-600" size={28} />
                        Medical History
                    </h2>

                    {patient.medicalRecords.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No medical records yet</p>
                    ) : (
                        <div className="space-y-4">
                            {patient.medicalRecords.map((record) => {
                                const symptoms = JSON.parse(record.symptoms);
                                const medications = record.medications ? JSON.parse(record.medications) : [];

                                return (
                                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-bold text-gray-800 text-lg">{record.diagnosis}</h3>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar size={16} className="mr-1" />
                                                {new Date(record.visitDate).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-semibold text-gray-700">Symptoms:</span>
                                                <span className="ml-2 text-gray-600">{symptoms.join(', ')}</span>
                                            </div>

                                            <div>
                                                <span className="font-semibold text-gray-700">Treatment:</span>
                                                <span className="ml-2 text-gray-600">{record.treatment}</span>
                                            </div>

                                            {medications.length > 0 && (
                                                <div>
                                                    <span className="font-semibold text-gray-700">Medications:</span>
                                                    <span className="ml-2 text-gray-600">{medications.join(', ')}</span>
                                                </div>
                                            )}

                                            {record.notes && (
                                                <div>
                                                    <span className="font-semibold text-gray-700">Notes:</span>
                                                    <span className="ml-2 text-gray-600">{record.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Alerts */}
                {patient.medicalAlerts.length > 0 && (
                    <div className="card slide-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <AlertCircle className="mr-2 text-red-600" size={28} />
                            Medical Alerts
                        </h2>

                        <div className="space-y-3">
                            {patient.medicalAlerts.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={`/alert/${alert.id}`}
                                    className={`block p-4 rounded-lg border-2 hover:shadow-md transition-all duration-300 ${alert.status === 'PENDING'
                                        ? 'bg-red-50 border-red-200'
                                        : alert.status === 'ASSESSED'
                                            ? 'bg-yellow-50 border-yellow-200'
                                            : 'bg-green-50 border-green-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">Severity: {alert.severity}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${alert.status === 'PENDING' ? 'badge-high' :
                                            alert.status === 'ASSESSED' ? 'badge-medium' : 'badge-low'
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

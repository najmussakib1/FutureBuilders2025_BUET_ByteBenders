import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAlertWithAssessment, getRecommendedDoctors } from '@/app/actions/alert';
import RiskAssessmentDisplay from '@/components/alert/RiskAssessmentDisplay';
import WorkerIntervention, { DoctorEscalation } from '@/components/alert/WorkflowSteps';
import { CheckCircle, UserPlus, FileText } from 'lucide-react';
import CaseNotesTimeline from '@/components/alert/CaseNotesTimeline';

export default async function AlertPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const result = await getAlertWithAssessment(id);

    if (!result.success || !result.alert) {
        return <div className="p-8 text-center">Alert Not Found</div>;
    }

    const doctorsResult = await getRecommendedDoctors(result.alert.workerId);

    const { alert } = result as any;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Case Management</h1>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${alert.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        alert.status === 'ASSESSED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            alert.status === 'ESCALATED' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                        Status: {alert.status}
                    </span>
                </div>

                {/* 1. AI Analysis & Risk Assessment */}
                {alert.riskAssessment ? (
                    <RiskAssessmentDisplay
                        assessment={alert.riskAssessment as any}
                        response={alert.riskAssessment.emergencyResponse ? {
                            responseType: alert.riskAssessment.emergencyResponse.responseType || 'ADVICE_ONLY',
                            doctorAssigned: alert.riskAssessment.emergencyResponse.doctorAssigned,
                            doctorInfo: alert.riskAssessment.emergencyResponse.doctor ? {
                                name: alert.riskAssessment.emergencyResponse.doctor.name,
                                specialization: alert.riskAssessment.emergencyResponse.doctor.specialization,
                                phone: alert.riskAssessment.emergencyResponse.doctor.phone
                            } : undefined,
                            ambulanceDispatched: alert.riskAssessment.emergencyResponse.ambulanceDispatched,
                            ambulanceInfo: alert.riskAssessment.emergencyResponse.ambulance ? {
                                vehicleNumber: alert.riskAssessment.emergencyResponse.ambulance.vehicleNumber,
                                driverName: alert.riskAssessment.emergencyResponse.ambulance.driverName,
                                driverPhone: alert.riskAssessment.emergencyResponse.ambulance.driverPhone
                            } : undefined,
                            message: alert.riskAssessment.emergencyResponse.notes || 'Emergency response initiated.'
                        } : undefined}
                        patient={{
                            name: alert.patient.name,
                            patientId: alert.patient.patientId,
                        }}
                    />
                ) : (
                    <div className="glass-panel p-8 text-center text-slate-500 animate-pulse">
                        AI Analyzing...
                    </div>
                )}

                {/* 2. Worker Primary Intervention */}
                {(alert.status === 'PENDING' || (alert.status === 'ESCALATED' && !alert.primaryTreatment)) && (
                    <WorkerIntervention
                        alertId={alert.id}
                    />
                )}

                {/* Display recorded intervention if done */}
                {alert.primaryTreatment && (
                    <div className="glass-panel p-6 border-l-4 border-teal-500 mt-6 opacity-75 grayscale hover:grayscale-0 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="text-teal-600 w-5 h-5" />
                            <h3 className="font-bold text-slate-800">Community Worker Report</h3>
                        </div>
                        <p className="text-slate-600 italic">"{alert.primaryTreatment}"</p>
                    </div>
                )}

                {/* 3. Escalate to Doctor */}
                {alert.status === 'ASSESSED' && !!alert.primaryTreatment && (
                    <DoctorEscalation
                        alertId={alert.id}
                        doctors={doctorsResult.doctors || []}
                    />
                )}

                {/* 4. Doctor Assignment View */}
                {alert.status === 'ESCALATED' && alert.doctor && (
                    <div className="glass-panel p-6 border-l-4 border-indigo-500 mt-6 bg-indigo-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-900">Forwarded to Dr. {alert.doctor.name}</h3>
                                <p className="text-sm text-indigo-600">Waiting for doctor's resolution...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Collaborative Timeline - Doctor Instructions & Worker Updates */}
                {(alert.status === 'ESCALATED' || alert.status === 'RESOLVED') && (
                    <div className="mt-8 h-[500px]">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={24} className="text-teal-600" />
                            Clinical Record & Instructions
                        </h3>
                        <CaseNotesTimeline
                            alertId={alert.id}
                            initialNotes={(alert.caseNotes as any) || []}
                            currentUserId={session.user.id}
                            currentUserRole="WORKER"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

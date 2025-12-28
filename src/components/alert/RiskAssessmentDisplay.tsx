'use client';

import { Brain, AlertTriangle, CheckCircle, Ambulance, Stethoscope, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RiskAssessmentDisplayProps {
    assessment: {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        aiAnalysis: string;
        primaryCareAdvice: string;
        requiresSpecialist: boolean;
        specialistType?: string | null;
        estimatedSeverity: number;
    };
    response?: {
        responseType: string;
        doctorAssigned: boolean;
        doctorInfo?: {
            name: string;
            specialization: string;
            phone: string;
        };
        ambulanceDispatched: boolean;
        ambulanceInfo?: {
            vehicleNumber: string;
            driverName: string;
            driverPhone: string;
        };
        message: string;
    };
    patient: {
        name: string;
        patientId: string;
    };
}

export default function RiskAssessmentDisplay({
    assessment,
    response,
    patient,
}: RiskAssessmentDisplayProps) {
    const getRiskColor = () => {
        switch (assessment.riskLevel) {
            case 'LOW':
                return 'from-green-400 to-green-600';
            case 'MEDIUM':
                return 'from-yellow-400 to-orange-500';
            case 'HIGH':
                return 'from-red-500 to-red-700';
        }
    };

    const getRiskIcon = () => {
        switch (assessment.riskLevel) {
            case 'LOW':
                return <CheckCircle size={48} />;
            case 'MEDIUM':
                return <AlertTriangle size={48} />;
            case 'HIGH':
                return <AlertTriangle size={48} className="animate-pulse" />;
        }
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Risk Level Header */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`card bg-gradient-to-r ${getRiskColor()} text-white p-8`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Risk Assessment Complete</h2>
                        <p className="text-lg opacity-90">Patient: {patient.name} ({patient.patientId})</p>
                    </div>
                    <div className="text-right">
                        {getRiskIcon()}
                        <p className="text-2xl font-bold mt-2">{assessment.riskLevel} RISK</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                    <TrendingUp size={20} />
                    <span className="text-lg">Severity Score: {assessment.estimatedSeverity}/10</span>
                </div>
            </motion.div>

            {/* AI Analysis */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="card"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Brain className="mr-2 text-purple-600" size={24} />
                    AI Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">{assessment.aiAnalysis}</p>
            </motion.div>

            {/* Primary Care Advice */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="card bg-blue-50 border-2 border-blue-200"
            >
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <Stethoscope className="mr-2 text-blue-600" size={24} />
                    Primary Care Instructions
                </h3>
                <p className="text-blue-800 leading-relaxed font-medium">{assessment.primaryCareAdvice}</p>
            </motion.div>

            {/* Specialist Requirement */}
            {assessment.requiresSpecialist && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="card bg-purple-50 border-2 border-purple-200"
                >
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Specialist Required</h3>
                    {assessment.specialistType && (
                        <p className="text-purple-800 font-medium">
                            Recommended: {assessment.specialistType}
                        </p>
                    )}
                </motion.div>
            )}

            {/* Emergency Response */}
            {response && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`card ${assessment.riskLevel === 'HIGH'
                            ? 'bg-red-50 border-2 border-red-300'
                            : 'bg-green-50 border-2 border-green-200'
                        }`}
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Response Status</h3>

                    <div className="space-y-4">
                        {/* Response Message */}
                        <div className={`p-4 rounded-lg ${assessment.riskLevel === 'HIGH' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                            <p className="font-semibold text-gray-800">{response.message}</p>
                        </div>

                        {/* Doctor Assignment */}
                        {response.doctorAssigned && response.doctorInfo && (
                            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                                    <Stethoscope size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">Doctor Assigned</h4>
                                    <p className="text-gray-700">Dr. {response.doctorInfo.name}</p>
                                    <p className="text-sm text-gray-600">{response.doctorInfo.specialization}</p>
                                    <p className="text-sm font-semibold text-blue-600 mt-1">
                                        📞 {response.doctorInfo.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Ambulance Dispatch */}
                        {response.ambulanceDispatched && response.ambulanceInfo && (
                            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border-2 border-red-300">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white pulse-animation">
                                    <Ambulance size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-800">🚨 Ambulance Dispatched</h4>
                                    <p className="text-gray-700">Vehicle: {response.ambulanceInfo.vehicleNumber}</p>
                                    <p className="text-sm text-gray-600">
                                        Driver: {response.ambulanceInfo.driverName}
                                    </p>
                                    <p className="text-sm font-semibold text-red-600 mt-1">
                                        📞 {response.ambulanceInfo.driverPhone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2 border-t">
                            <Clock size={16} />
                            <span>Response initiated at {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={() => window.print()}
                    className="flex-1 btn-primary"
                >
                    Print Report
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

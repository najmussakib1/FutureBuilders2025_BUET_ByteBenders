
import { AlertTriangle, ShieldCheck, HeartPulse, User } from 'lucide-react';

export interface Assessment {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    aiAnalysis: string;
    primaryCareAdvice: string;
    requiresSpecialist: boolean;
    specialistType?: string;
    estimatedSeverity: number;
}

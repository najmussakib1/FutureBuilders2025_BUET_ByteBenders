import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskAssessmentResult {
    riskLevel: RiskLevel;
    aiAnalysis: string;
    primaryCareAdvice: string;
    requiresSpecialist: boolean;
    specialistType?: string;
    estimatedSeverity: number; // 1-10
}

export interface PatientContext {
    age: number;
    gender: string;
    chronicDiseases?: string[];
    allergies?: string[];
    medicalHistory?: Array<{
        diagnosis: string;
        treatment: string;
        date: string;
    }>;
}

export interface AlertData {
    symptoms: string[];
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    vitalSigns?: {
        temperature?: number;
        bloodPressure?: string;
        pulse?: number;
        oxygenSaturation?: number;
    };
    description?: string;
}

export async function assessRisk(
    alertData: AlertData,
    patientContext: PatientContext
): Promise<RiskAssessmentResult> {
    const prompt = buildAssessmentPrompt(alertData, patientContext);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert medical AI assistant helping community health workers in rural areas make critical healthcare decisions. Your role is to:
1. Analyze patient symptoms and medical history
2. Classify risk level as LOW, MEDIUM, or HIGH
3. Provide immediate primary care advice
4. Determine if specialist care is needed

RISK CLASSIFICATION GUIDELINES:
- LOW: Minor ailments, manageable with basic care and routine doctor consultation
- MEDIUM: Concerning symptoms requiring urgent medical attention within hours
- HIGH: Life-threatening conditions requiring immediate emergency response and ambulance

Be concise, clear, and actionable. Lives depend on your assessment.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 1000,
        });

        const response = completion.choices[0]?.message?.content || '';
        return parseAIResponse(response);
    } catch (error) {
        console.error('Groq AI Error:', error);
        // Fallback to rule-based assessment
        return fallbackAssessment(alertData, patientContext);
    }
}

function buildAssessmentPrompt(
    alertData: AlertData,
    patientContext: PatientContext
): string {
    let prompt = `PATIENT INFORMATION:
- Age: ${patientContext.age} years
- Gender: ${patientContext.gender}
`;

    if (patientContext.chronicDiseases && patientContext.chronicDiseases.length > 0) {
        prompt += `- Chronic Diseases: ${patientContext.chronicDiseases.join(', ')}\n`;
    }

    if (patientContext.allergies && patientContext.allergies.length > 0) {
        prompt += `- Allergies: ${patientContext.allergies.join(', ')}\n`;
    }

    if (patientContext.medicalHistory && patientContext.medicalHistory.length > 0) {
        prompt += `\nRECENT MEDICAL HISTORY:\n`;
        patientContext.medicalHistory.slice(0, 3).forEach((record, idx) => {
            prompt += `${idx + 1}. ${record.diagnosis} - Treated with ${record.treatment} (${record.date})\n`;
        });
    }

    prompt += `\nCURRENT ALERT:
- Reported Severity: ${alertData.severity}
- Symptoms: ${alertData.symptoms.join(', ')}
`;

    if (alertData.vitalSigns) {
        prompt += `\nVITAL SIGNS:\n`;
        if (alertData.vitalSigns.temperature) {
            prompt += `- Temperature: ${alertData.vitalSigns.temperature}°F\n`;
        }
        if (alertData.vitalSigns.bloodPressure) {
            prompt += `- Blood Pressure: ${alertData.vitalSigns.bloodPressure}\n`;
        }
        if (alertData.vitalSigns.pulse) {
            prompt += `- Pulse: ${alertData.vitalSigns.pulse} bpm\n`;
        }
        if (alertData.vitalSigns.oxygenSaturation) {
            prompt += `- Oxygen Saturation: ${alertData.vitalSigns.oxygenSaturation}%\n`;
        }
    }

    if (alertData.description) {
        prompt += `\nADDITIONAL NOTES: ${alertData.description}\n`;
    }

    prompt += `\nPlease provide your assessment in the following JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "aiAnalysis": "Brief analysis of the situation",
  "primaryCareAdvice": "Immediate steps the community worker should take",
  "requiresSpecialist": true/false,
  "specialistType": "Type of specialist if needed",
  "estimatedSeverity": 1-10
}`;

    return prompt;
}

function parseAIResponse(response: string): RiskAssessmentResult {
    try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            riskLevel: parsed.riskLevel as RiskLevel,
            aiAnalysis: parsed.aiAnalysis,
            primaryCareAdvice: parsed.primaryCareAdvice,
            requiresSpecialist: parsed.requiresSpecialist,
            specialistType: parsed.specialistType,
            estimatedSeverity: parsed.estimatedSeverity,
        };
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        // Extract what we can from the text
        const riskLevel = extractRiskLevel(response);
        return {
            riskLevel,
            aiAnalysis: response.substring(0, 500),
            primaryCareAdvice: 'Consult with medical professional immediately.',
            requiresSpecialist: riskLevel !== 'LOW',
            estimatedSeverity: riskLevel === 'HIGH' ? 8 : riskLevel === 'MEDIUM' ? 5 : 2,
        };
    }
}

function extractRiskLevel(text: string): RiskLevel {
    const upperText = text.toUpperCase();
    if (upperText.includes('HIGH') || upperText.includes('CRITICAL') || upperText.includes('EMERGENCY')) {
        return 'HIGH';
    }
    if (upperText.includes('MEDIUM') || upperText.includes('MODERATE') || upperText.includes('URGENT')) {
        return 'MEDIUM';
    }
    return 'LOW';
}

function fallbackAssessment(
    alertData: AlertData,
    patientContext: PatientContext
): RiskAssessmentResult {
    // Simple rule-based fallback
    let severity = 0;

    // Check vital signs
    if (alertData.vitalSigns) {
        if (alertData.vitalSigns.temperature && alertData.vitalSigns.temperature > 103) severity += 3;
        if (alertData.vitalSigns.pulse && (alertData.vitalSigns.pulse > 120 || alertData.vitalSigns.pulse < 50)) severity += 3;
        if (alertData.vitalSigns.oxygenSaturation && alertData.vitalSigns.oxygenSaturation < 90) severity += 4;
    }

    // Check reported severity
    if (alertData.severity === 'SEVERE') severity += 3;
    if (alertData.severity === 'MODERATE') severity += 2;

    // Check age
    if (patientContext.age > 65 || patientContext.age < 5) severity += 1;

    // Critical symptoms
    const criticalSymptoms = ['chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding', 'stroke'];
    const hasCritical = alertData.symptoms.some(s =>
        criticalSymptoms.some(cs => s.toLowerCase().includes(cs))
    );
    if (hasCritical) severity += 5;

    const riskLevel: RiskLevel = severity >= 7 ? 'HIGH' : severity >= 4 ? 'MEDIUM' : 'LOW';

    return {
        riskLevel,
        aiAnalysis: 'Automated assessment based on vital signs and symptoms.',
        primaryCareAdvice: riskLevel === 'HIGH'
            ? 'Keep patient stable, monitor vital signs, prepare for emergency transport.'
            : riskLevel === 'MEDIUM'
                ? 'Monitor patient closely, provide supportive care, arrange medical consultation.'
                : 'Provide basic care, rest, and schedule routine doctor visit.',
        requiresSpecialist: riskLevel !== 'LOW',
        estimatedSeverity: severity,
    };
}
export async function generateResolutionSummary(
    alertInfo: { symptoms: string[]; aiAnalysis: string },
    doctorNotes: string
): Promise<{ diagnosis: string; treatment: string; notes: string }> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a medical scribe. Your task is to summarize a patient's emergency encounter and the doctor's resolution into a structured medical record entry.
                    Provide the output in JSON format with "diagnosis", "treatment", and "notes" fields.
                    Be professional, concise, and accurate.`
                },
                {
                    role: 'user',
                    content: `ALERT INFORMATION:
                    - Symptoms: ${alertInfo.symptoms.join(', ')}
                    - Initial AI Analysis: ${alertInfo.aiAnalysis}

                    DOCTOR'S RESOLUTION NOTES:
                    ${doctorNotes}

                    Please provide a professional summary.`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content || '';
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            diagnosis: parsed.diagnosis || 'Undiagnosed',
            treatment: parsed.treatment || 'Standard care provided',
            notes: parsed.notes || doctorNotes
        };
    } catch (error) {
        console.error('AI Summary Error:', error);
        return {
            diagnosis: 'Follow-up required',
            treatment: 'Emergency resolved',
            notes: doctorNotes
        };
    }
}

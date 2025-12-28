'use client';

import { useState } from 'react';
import { createAlert } from '@/app/actions/alert';
import { AlertCircle, Thermometer, Heart, Activity, Droplet, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const COMMON_SYMPTOMS = [
    'Fever',
    'Cough',
    'Headache',
    'Chest Pain',
    'Difficulty Breathing',
    'Abdominal Pain',
    'Nausea',
    'Vomiting',
    'Dizziness',
    'Fatigue',
    'Body Ache',
    'Diarrhea',
];

export default function AlertForm({
    patientId,
    workerId,
}: {
    patientId: string;
    workerId: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState('');
    const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MILD');
    const [description, setDescription] = useState('');
    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        bloodPressure: '',
        pulse: '',
        oxygenSaturation: '',
    });

    const toggleSymptom = (symptom: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    const addCustomSymptom = () => {
        if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
            setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
            setCustomSymptom('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSymptoms.length === 0) {
            alert('Please select at least one symptom');
            return;
        }

        setLoading(true);

        const vitalSignsData = {
            ...(vitalSigns.temperature && { temperature: parseFloat(vitalSigns.temperature) }),
            ...(vitalSigns.bloodPressure && { bloodPressure: vitalSigns.bloodPressure }),
            ...(vitalSigns.pulse && { pulse: parseInt(vitalSigns.pulse) }),
            ...(vitalSigns.oxygenSaturation && { oxygenSaturation: parseInt(vitalSigns.oxygenSaturation) }),
        };

        const result = await createAlert({
            patientId,
            workerId,
            symptoms: selectedSymptoms,
            severity,
            vitalSigns: Object.keys(vitalSignsData).length > 0 ? vitalSignsData : undefined,
            description: description,
        });

        setLoading(false);

        if (result.success) {
            router.push(`/alert/${result.alert.id}`);
        } else {
            alert(result.error || 'Failed to create alert');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Selection */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="mr-2 text-blue-600" size={24} />
                    Select Symptoms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {COMMON_SYMPTOMS.map((symptom) => (
                        <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedSymptoms.includes(symptom)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {symptom}
                        </button>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        placeholder="Add custom symptom..."
                        className="input-field flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                    />
                    <button
                        type="button"
                        onClick={addCustomSymptom}
                        className="btn-primary"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                {selectedSymptoms.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedSymptoms.map((symptom) => (
                            <span
                                key={symptom}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                            >
                                {symptom}
                                <button
                                    type="button"
                                    onClick={() => toggleSymptom(symptom)}
                                    className="ml-2 hover:text-blue-900"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Severity */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Severity Level</h3>
                <div className="grid grid-cols-3 gap-4">
                    {(['MILD', 'MODERATE', 'SEVERE'] as const).map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setSeverity(level)}
                            className={`px-6 py-4 rounded-lg font-bold transition-all duration-300 ${severity === level
                                ? level === 'MILD'
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : level === 'MODERATE'
                                        ? 'bg-yellow-500 text-white shadow-lg'
                                        : 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vital Signs */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Vital Signs (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Thermometer className="inline mr-2" size={16} />
                            Temperature (°F)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={vitalSigns.temperature}
                            onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                            placeholder="98.6"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Activity className="inline mr-2" size={16} />
                            Blood Pressure
                        </label>
                        <input
                            type="text"
                            value={vitalSigns.bloodPressure}
                            onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                            placeholder="120/80"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Heart className="inline mr-2" size={16} />
                            Pulse (bpm)
                        </label>
                        <input
                            type="number"
                            value={vitalSigns.pulse}
                            onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                            placeholder="72"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Droplet className="inline mr-2" size={16} />
                            Oxygen Saturation (%)
                        </label>
                        <input
                            type="number"
                            value={vitalSigns.oxygenSaturation}
                            onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                            placeholder="98"
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Notes */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Notes</h3>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any additional observations or patient complaints..."
                    rows={4}
                    className="input-field resize-none"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || selectedSymptoms.length === 0}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <div className="spinner mr-3"></div>
                        Processing with AI...
                    </span>
                ) : (
                    'Submit for AI Assessment'
                )}
            </button>
        </form>
    );
}

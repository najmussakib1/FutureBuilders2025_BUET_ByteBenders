'use client';

import { useState } from 'react';
import { createPatient } from '@/app/actions/patient';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Droplet, Plus, X } from 'lucide-react';
import LocationPicker from '@/components/alert/LocationPicker';

export default function NewPatientForm({ workerId }: { workerId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        village: '',
        bloodGroup: '',
    });
    const [allergies, setAllergies] = useState<string[]>([]);
    const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
    const [newAllergy, setNewAllergy] = useState('');
    const [newDisease, setNewDisease] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createPatient({
            ...formData,
            age: parseInt(formData.age),
            allergies: allergies.length > 0 ? allergies : undefined,
            chronicDiseases: chronicDiseases.length > 0 ? chronicDiseases : undefined,
            workerId,
            lat: location?.lat,
            lng: location?.lng,
        });

        setLoading(false);

        if (result.success && result.patient) {
            router.push(`/patient/${result.patient.id}`);
        } else {
            alert(result.error || 'Failed to create patient');
        }
    };

    const addAllergy = () => {
        if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
            setAllergies([...allergies, newAllergy.trim()]);
            setNewAllergy('');
        }
    };

    const addDisease = () => {
        if (newDisease.trim() && !chronicDiseases.includes(newDisease.trim())) {
            setChronicDiseases([...chronicDiseases, newDisease.trim()]);
            setNewDisease('');
        }
    };

    const handlePinLocation = () => {
        // Mocking user selection on a map
        // Rural areas are often simplified.
        const mockLat = 23.8103 + (Math.random() - 0.5) * 0.01;
        const mockLng = 90.4125 + (Math.random() - 0.5) * 0.01;
        setLocation({ lat: mockLat, lng: mockLng });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-blue-600" size={24} />
                    Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Age *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            max="150"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="input-field"
                            placeholder="25"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender *
                        </label>
                        <select
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="input-field"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="inline mr-1" size={16} />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field"
                            placeholder="+1234567890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Droplet className="inline mr-1" size={16} />
                            Blood Group
                        </label>
                        <select
                            value={formData.bloodGroup}
                            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Select...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="inline mr-1" size={16} />
                            Address *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="input-field"
                            placeholder="House number, Street name"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Village *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.village}
                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                            className="input-field"
                            placeholder="Village name"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <LocationPicker
                            initialLocation={location}
                            onLocationSelect={setLocation}
                            label="Emergency Response Location"
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Medical Information</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Allergies
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                                className="input-field flex-1"
                                placeholder="Add allergy..."
                            />
                            <button type="button" onClick={addAllergy} className="btn-primary">
                                <Plus size={20} />
                            </button>
                        </div>
                        {allergies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {allergies.map((allergy, idx) => (
                                    <span key={idx} className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                        {allergy}
                                        <button
                                            type="button"
                                            onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))}
                                            className="ml-2"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Chronic Diseases
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={newDisease}
                                onChange={(e) => setNewDisease(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                                className="input-field flex-1"
                                placeholder="Add chronic disease..."
                            />
                            <button type="button" onClick={addDisease} className="btn-primary">
                                <Plus size={20} />
                            </button>
                        </div>
                        {chronicDiseases.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {chronicDiseases.map((disease, idx) => (
                                    <span key={idx} className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                        {disease}
                                        <button
                                            type="button"
                                            onClick={() => setChronicDiseases(chronicDiseases.filter((_, i) => i !== idx))}
                                            className="ml-2"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50"
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <div className="spinner mr-3"></div>
                        Creating Patient...
                    </span>
                ) : (
                    'Create Patient'
                )}
            </button>
        </form>
    );
}

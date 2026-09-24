import React, { useEffect, useState } from 'react';

interface Medication { id?: string; medication?: string; name?: string; dosage?: string; frequency?: string; duration?: string; status?: string; patientId?: string; }

export default function PrescriptionManagement() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/medications/me', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        setMedications(Array.isArray(data.medications) ? data.medications : []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Medications & Prescriptions</h2>
      <p className="text-sm text-gray-500 mb-6">Showing medication records returned by your authenticated EasyMed account.</p>
      {loading ? <p>Loading medication records…</p> : medications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">No medication records found.</div>
      ) : (
        <div className="space-y-3">
          {medications.map((item, index) => (
            <div key={item.id || index} className="border rounded-lg p-4">
              <div className="flex justify-between gap-4">
                <h3 className="font-medium text-gray-900">{item.medication || item.name || 'Medication'}</h3>
                {item.status && <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{item.status}</span>}
              </div>
              <p className="text-sm text-gray-600 mt-2">{[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ') || 'Prescription details not available'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

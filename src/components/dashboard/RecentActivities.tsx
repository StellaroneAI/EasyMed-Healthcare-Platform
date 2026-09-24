import React, { useEffect, useState } from 'react';

interface Appointment { id?: string; scheduledTime?: string; status?: string; type?: string; patientId?: string; doctorId?: string; }

export default function RecentActivities() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments/me', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        setAppointments(Array.isArray(data.appointments) ? data.appointments.slice(0, 5) : []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Appointments</h2>
      {loading ? <p>Loading…</p> : appointments.length === 0 ? (
        <p className="text-sm text-gray-500">No appointment activity available.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <div key={appointment.id || index} className="border-b last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-medium text-gray-900">{appointment.type || 'Consultation'}</p>
              <p className="text-sm text-gray-600">{appointment.scheduledTime ? new Date(appointment.scheduledTime).toLocaleString() : 'Time not available'}</p>
              <p className="text-xs text-gray-500 mt-1">Status: {appointment.status || 'unknown'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

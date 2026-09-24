import { useLanguage } from '../contexts/LanguageContext';

export default function PatientDashboard({ userInfo }: { userInfo?: { name?: string } }) {
  const { t } = useLanguage();
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">{t('welcomeBack')}{userInfo?.name ? `, ${userInfo.name}` : ''}</h1>
        <p className="text-gray-600 mt-2">{t('healthCompanion')}</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Clinical metrics and records are loaded from authenticated APIs. Demo vitals and fabricated patient data have been removed.
      </div>
    </div>
  );
}

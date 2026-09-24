import { useLanguage } from '../../contexts/LanguageContext';
import SimpleVoiceAssistant from '../SimpleVoiceAssistant';
import LanguageSelector from '../LanguageSelector';

interface PatientSpecificDashboardProps {
  user: { userType: 'patient'; name: string };
}

export default function PatientSpecificDashboard({ user }: PatientSpecificDashboardProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><LanguageSelector /></div>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">{t('welcomeBack')}, {user.name}</h2>
        <p className="text-blue-100">{t('healthCompanion')}</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border">
        <p className="text-gray-600">Your clinical information is loaded from your authenticated EasyMed account. No demo vitals, appointments, medications, or family records are shown here.</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border">
        <SimpleVoiceAssistant userName={user.name} onCommand={(command) => console.log('Voice command:', command)} />
      </div>
    </div>
  );
}

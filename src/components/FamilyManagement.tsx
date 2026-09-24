import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useABHA } from '../contexts/ABHAContext';
import { abhaService, ABHAFamilyMember } from '../services/abhaService';

export default function FamilyManagement() {
  const { currentLanguage } = useLanguage();
  const { abhaProfile, isABHAConnected } = useABHA();
  const [familyMembers, setFamilyMembers] = useState<ABHAFamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationshipType: 'SPOUSE' as ABHAFamilyMember['relationshipType'],
    dateOfBirth: '',
    gender: 'M' as 'M' | 'F' | 'O',
    mobile: '',
    healthId: ''
  });

  // Family translations
  const familyTexts = {
    english: {
      title: "👨‍👩‍👧‍👦 Family Health Management",
      subtitle: "Manage health accounts for your family",
      addMember: "Add Family Member",
      noMembers: "No family members added yet",
      relationship: "Relationship",
      name: "Name",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      mobile: "Mobile Number",
      healthId: "ABHA Health ID (Optional)",
      save: "Save Member",
      cancel: "Cancel",
      male: "Male",
      female: "Female",
      other: "Other",
      spouse: "Spouse",
      child: "Child",
      parent: "Parent",
      sibling: "Sibling",
      linked: "ABHA Linked",
      notLinked: "Not Linked",
      linkAbha: "Link ABHA",
      viewRecords: "View Records",
      consentGiven: "Consent Given",
      requestConsent: "Request Consent",
      age: "Age"
    },
    hindi: {
      title: "👨‍👩‍👧‍👦 पारिवारिक स्वास्थ्य प्रबंधन",
      subtitle: "अपने परिवार के लिए स्वास्थ्य खाते प्रबंधित करें",
      addMember: "परिवारी सदस्य जोड़ें",
      noMembers: "अभी तक कोई परिवारी सदस्य नहीं जोड़ा गया",
      relationship: "रिश्ता",
      name: "नाम",
      dateOfBirth: "जन्म तिथि",
      gender: "लिंग",
      mobile: "मोबाइल नंबर",
      healthId: "आभा स्वास्थ्य आईडी (वैकल्पिक)",
      save: "सदस्य सेव करें",
      cancel: "रद्द करें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      spouse: "पति/पत्नी",
      child: "बच्चा",
      parent: "माता-पिता",
      sibling: "भाई-बहन",
      linked: "आभा जुड़ा हुआ",
      notLinked: "जुड़ा नहीं है",
      linkAbha: "आभा लिंक करें",
      viewRecords: "रिकॉर्ड देखें",
      consentGiven: "सहमति दी गई",
      requestConsent: "सहमति का अनुरोध करें",
      age: "उम्र"
    }
  };

  const getFamilyText = (key: keyof typeof familyTexts.english): string => {
    return familyTexts[currentLanguage as keyof typeof familyTexts]?.[key] || familyTexts.english[key];
  };

  useEffect(() => {
    if (isABHAConnected && abhaProfile) {
      loadFamilyMembers();
    }
  }, [isABHAConnected, abhaProfile]);

  const loadFamilyMembers = async () => {
    if (!abhaProfile) return;

    setIsLoading(true);
    try {
      const members = await abhaService.getFamilyMembers(abhaProfile.healthId, '');
        setFamilyMembers(members);
      }
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!abhaProfile || !newMember.name || !newMember.dateOfBirth) return;

    setIsLoading(true);
    try {
      const memberData = {
          relationshipType: newMember.relationshipType,
          healthId: newMember.healthId || `FM_${Date.now()}`,
          name: newMember.name,
          dateOfBirth: newMember.dateOfBirth,
          gender: newMember.gender,
          mobile: newMember.mobile
        };

        const success = await abhaService.addFamilyMember(
          abhaProfile.healthId,
          memberData, '');

        if (success) {
          await loadFamilyMembers();
          setShowAddMember(false);
          setNewMember({
            name: '',
            relationshipType: 'SPOUSE',
            dateOfBirth: '',
            gender: 'M',
            mobile: '',
            healthId: ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to add family member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkABHA = async (memberHealthId: string) => {
    if (!abhaProfile) return;

    setIsLoading(true);
    try {
      await abhaService.linkFamilyMemberABHA(
          abhaProfile.healthId,
          memberHealthId, '');
        await loadFamilyMembers();
      }
    } catch (error) {
      console.error('Failed to link family member ABHA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!isABHAConnected) {
    return (
      <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-semibold mb-2">{getFamilyText('title')}</h3>
          <p className="text-gray-600 mb-4">Connect ABHA to manage family health accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">{getFamilyText('title')}</h3>
          <p className="text-sm text-gray-600">{getFamilyText('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
        >
          {getFamilyText('addMember')}
        </button>
      </div>

      {/* Family Members List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family members...</p>
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-4">👤</div>
          <p className="text-gray-600">{getFamilyText('noMembers')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {familyMembers.map((member) => (
            <div key={member.healthId} className="bg-white/50 p-4 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {member.gender === 'F' ? '👩' : member.gender === 'M' ? '👨' : '👤'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{member.name}</h4>
                      <p className="text-sm text-gray-600">
                        {getFamilyText(member.relationshipType.toLowerCase() as keyof typeof familyTexts.english)} • 
                        {getFamilyText('age')}: {calculateAge(member.dateOfBirth)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          member.isLinked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {member.isLinked ? getFamilyText('linked') : getFamilyText('notLinked')}
                        </span>
                        {member.consentGiven && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {getFamilyText('consentGiven')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {!member.isLinked ? (
                    <button
                      onClick={() => handleLinkABHA(member.healthId)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {getFamilyText('linkAbha')}
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all"
                    >
                      {getFamilyText('viewRecords')}
                    </button>
                  )}
                  {!member.consentGiven && (
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-all"
                    >
                      {getFamilyText('requestConsent')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{getFamilyText('addMember')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('name')}</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder={getFamilyText('name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('relationship')}</label>
                <select
                  value={newMember.relationshipType}
                  onChange={(e) => setNewMember({...newMember, relationshipType: e.target.value as ABHAFamilyMember['relationshipType']})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="SPOUSE">{getFamilyText('spouse')}</option>
                  <option value="CHILD">{getFamilyText('child')}</option>
                  <option value="PARENT">{getFamilyText('parent')}</option>
                  <option value="SIBLING">{getFamilyText('sibling')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('dateOfBirth')}</label>
                <input
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('gender')}</label>
                <select
                  value={newMember.gender}
                  onChange={(e) => setNewMember({...newMember, gender: e.target.value as 'M' | 'F' | 'O'})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="M">{getFamilyText('male')}</option>
                  <option value="F">{getFamilyText('female')}</option>
                  <option value="O">{getFamilyText('other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('mobile')}</label>
                <input
                  type="tel"
                  value={newMember.mobile}
                  onChange={(e) => setNewMember({...newMember, mobile: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getFamilyText('healthId')}</label>
                <input
                  type="text"
                  value={newMember.healthId}
                  onChange={(e) => setNewMember({...newMember, healthId: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="14-digit ABHA Health ID (if available)"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
              >
                {getFamilyText('cancel')}
              </button>
              <button
                onClick={handleAddMember}
                disabled={isLoading || !newMember.name || !newMember.dateOfBirth}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : getFamilyText('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

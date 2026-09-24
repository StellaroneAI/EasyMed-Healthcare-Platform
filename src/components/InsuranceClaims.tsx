import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useABHA } from '../contexts/ABHAContext';
import { abhaService, InsuranceClaim } from '../services/abhaService';

export default function InsuranceClaims() {
  const { currentLanguage } = useLanguage();
  const { abhaProfile, isABHAConnected } = useABHA();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [newClaim, setNewClaim] = useState({
    treatmentType: '',
    hospitalName: '',
    treatmentDate: '',
    billAmount: '',
    documents: [] as File[]
  });
  const [eligibilityData, setEligibilityData] = useState<{
    isEligible: boolean;
    coverageAmount: number;
    deductible: number;
    coPayment: number;
    policyDetails: any;
  } | null>(null);

  // Insurance translations
  const insuranceTexts = {
    english: {
      title: "🛡️ Insurance Claims",
      subtitle: "Manage your health insurance claims",
      newClaim: "Submit New Claim",
      checkEligibility: "Check Eligibility",
      recentClaims: "Recent Claims",
      noClaims: "No claims submitted yet",
      claimId: "Claim ID",
      treatmentType: "Treatment Type",
      hospitalName: "Hospital Name",
      treatmentDate: "Treatment Date",
      billAmount: "Bill Amount",
      status: "Status",
      submitted: "Submitted",
      underReview: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      paid: "Paid",
      documents: "Upload Documents",
      submit: "Submit Claim",
      cancel: "Cancel",
      viewDetails: "View Details",
      download: "Download",
      trackClaim: "Track Claim",
      eligibilityTitle: "Insurance Eligibility",
      eligibleText: "You are eligible for coverage",
      notEligibleText: "Not eligible for this treatment",
      coverageAmount: "Coverage Amount",
      deductible: "Deductible",
      coPayment: "Co-payment",
      policyNumber: "Policy Number",
      policyProvider: "Insurance Provider",
      expiryDate: "Policy Expiry",
      close: "Close",
      uploadFiles: "Click to upload or drag files here",
      maxFiles: "Maximum 5 files, 10MB each",
      selectTreatment: "Select Treatment Type",
      enterHospital: "Enter Hospital Name",
      enterAmount: "Enter Bill Amount",
      cashless: "Cashless Treatment",
      reimbursement: "Reimbursement Claim",
      preAuth: "Pre-authorization",
      emergency: "Emergency Treatment"
    },
    hindi: {
      title: "🛡️ बीमा दावे",
      subtitle: "अपने स्वास्थ्य बीमा दावों का प्रबंधन करें",
      newClaim: "नया दावा जमा करें",
      checkEligibility: "पात्रता जांचें",
      recentClaims: "हाल के दावे",
      noClaims: "अभी तक कोई दावा जमा नहीं किया गया",
      claimId: "दावा आईडी",
      treatmentType: "उपचार प्रकार",
      hospitalName: "अस्पताल का नाम",
      treatmentDate: "उपचार की तारीख",
      billAmount: "बिल राशि",
      status: "स्थिति",
      submitted: "जमा किया गया",
      underReview: "समीक्षाधीन",
      approved: "अनुमोदित",
      rejected: "अस्वीकृत",
      paid: "भुगतान किया गया",
      documents: "दस्तावेज़ अपलोड करें",
      submit: "दावा जमा करें",
      cancel: "रद्द करें",
      viewDetails: "विवरण देखें",
      download: "डाउनलोड करें",
      trackClaim: "दावे को ट्रैक करें",
      eligibilityTitle: "बीमा पात्रता",
      eligibleText: "आप कवरेज के लिए पात्र हैं",
      notEligibleText: "इस उपचार के लिए पात्र नहीं",
      coverageAmount: "कवरेज राशि",
      deductible: "कटौती योग्य",
      coPayment: "सह-भुगतान",
      policyNumber: "पॉलिसी संख्या",
      policyProvider: "बीमा प्रदाता",
      expiryDate: "पॉलिसी समाप्ति",
      close: "बंद करें",
      uploadFiles: "अपलोड करने के लिए क्लिक करें या फाइलें यहां खींचें",
      maxFiles: "अधिकतम 5 फाइलें, प्रत्येक 10MB",
      selectTreatment: "उपचार प्रकार चुनें",
      enterHospital: "अस्पताल का नाम दर्ज करें",
      enterAmount: "बिल राशि दर्ज करें",
      cashless: "कैशलेस उपचार",
      reimbursement: "प्रतिपूर्ति दावा",
      preAuth: "पूर्व-प्राधिकरण",
      emergency: "आपातकालीन उपचार"
    }
  };

  const getInsuranceText = (key: keyof typeof insuranceTexts.english): string => {
    return insuranceTexts[currentLanguage as keyof typeof insuranceTexts]?.[key] || insuranceTexts.english[key];
  };

  const treatmentTypes = [
    'General Consultation',
    'Surgery',
    'Emergency Treatment',
    'Diagnostic Tests',
    'Pharmacy',
    'Dental Care',
    'Mental Health',
    'Maternity Care',
    'Rehabilitation',
    'Alternative Medicine'
  ];

  useEffect(() => {
    if (isABHAConnected && abhaProfile) {
      loadInsuranceClaims();
    }
  }, [isABHAConnected, abhaProfile]);

  const loadInsuranceClaims = async () => {
    if (!abhaProfile) return;

    setIsLoading(true);
    try {
      const claimsData = await abhaService.getInsuranceClaims(abhaProfile.healthId, '');
        setClaims(claimsData);
      }
    } catch (error) {
      console.error('Failed to load insurance claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!abhaProfile || !newClaim.treatmentType || !newClaim.hospitalName || !newClaim.treatmentDate || !newClaim.billAmount) return;

    setIsLoading(true);
    try {
      const claimData = {
          patientId: abhaProfile.healthId,
          treatmentType: newClaim.treatmentType,
          hospitalName: newClaim.hospitalName,
          treatmentDate: newClaim.treatmentDate,
          billAmount: parseFloat(newClaim.billAmount),
          documents: newClaim.documents.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          }))
        };

        const claim = await abhaService.submitInsuranceClaim(abhaProfile.healthId, claimData, newClaim.documents);
        
        if (claim) {
          await loadInsuranceClaims();
          setShowNewClaim(false);
          resetClaimForm();
        }
      }
    } catch (error) {
      console.error('Failed to submit insurance claim:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!abhaProfile) return;

    setIsLoading(true);
    try {
      const eligibility = await abhaService.checkInsuranceEligibility(
          abhaProfile.healthId,
          newClaim.treatmentType || 'General Consultation',
          'Unknown',
        );
        setEligibilityData(eligibility);
        setShowEligibilityCheck(true);
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetClaimForm = () => {
    setNewClaim({
      treatmentType: '',
      hospitalName: '',
      treatmentDate: '',
      billAmount: '',
      documents: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files).slice(0, 5); // Max 5 files
    setNewClaim({...newClaim, documents: fileArray});
  };

  if (!isABHAConnected) {
    return (
      <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-lg font-semibold mb-2">{getInsuranceText('title')}</h3>
          <p className="text-gray-600 mb-4">Connect ABHA to access insurance services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">{getInsuranceText('title')}</h3>
          <p className="text-sm text-gray-600">{getInsuranceText('subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkEligibility}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-all text-sm"
          >
            {getInsuranceText('checkEligibility')}
          </button>
          <button
            onClick={() => setShowNewClaim(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
          >
            {getInsuranceText('newClaim')}
          </button>
        </div>
      </div>

      {/* Claims List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-4">📋</div>
          <p className="text-gray-600">{getInsuranceText('noClaims')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-medium">{getInsuranceText('recentClaims')}</h4>
          {claims.map((claim) => (
            <div key={claim.claimId} className="bg-white/50 p-4 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      🏥
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium truncate">{claim.treatmentType}</h5>
                      <p className="text-xs text-gray-600">{claim.hospitalName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">{getInsuranceText('claimId')}: </span>
                      <span className="font-medium">{claim.claimId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{getInsuranceText('billAmount')}: </span>
                      <span className="font-medium">{formatAmount(claim.claimedAmount)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(claim.status)}`}>
                      {getInsuranceText(claim.status.toLowerCase().replace('_', '') as keyof typeof insuranceTexts.english)}
                    </span>
                    {claim.approvedAmount && claim.approvedAmount > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        Approved: {formatAmount(claim.approvedAmount)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1 ml-4">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all">
                    {getInsuranceText('viewDetails')}
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all">
                    {getInsuranceText('trackClaim')}
                  </button>
                  {claim.status === 'APPROVED' && (
                    <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-all">
                      {getInsuranceText('download')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Claim Modal */}
      {showNewClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{getInsuranceText('newClaim')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{getInsuranceText('treatmentType')}</label>
                <select
                  value={newClaim.treatmentType}
                  onChange={(e) => setNewClaim({...newClaim, treatmentType: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">{getInsuranceText('selectTreatment')}</option>
                  {treatmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getInsuranceText('hospitalName')}</label>
                <input
                  type="text"
                  value={newClaim.hospitalName}
                  onChange={(e) => setNewClaim({...newClaim, hospitalName: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder={getInsuranceText('enterHospital')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getInsuranceText('treatmentDate')}</label>
                <input
                  type="date"
                  value={newClaim.treatmentDate}
                  onChange={(e) => setNewClaim({...newClaim, treatmentDate: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getInsuranceText('billAmount')}</label>
                <input
                  type="number"
                  value={newClaim.billAmount}
                  onChange={(e) => setNewClaim({...newClaim, billAmount: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder={getInsuranceText('enterAmount')}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{getInsuranceText('documents')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      <p className="text-sm">{getInsuranceText('uploadFiles')}</p>
                      <p className="text-xs mt-1">{getInsuranceText('maxFiles')}</p>
                    </div>
                  </label>
                  {newClaim.documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">{newClaim.documents.length} files selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewClaim(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
              >
                {getInsuranceText('cancel')}
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={isLoading || !newClaim.treatmentType || !newClaim.hospitalName || !newClaim.treatmentDate || !newClaim.billAmount}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : getInsuranceText('submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Check Modal */}
      {showEligibilityCheck && eligibilityData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{getInsuranceText('eligibilityTitle')}</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${eligibilityData.isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${eligibilityData.isEligible ? 'text-green-600' : 'text-red-600'}`}>
                    {eligibilityData.isEligible ? '✅' : '❌'}
                  </span>
                  <p className={`font-medium ${eligibilityData.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                    {eligibilityData.isEligible ? getInsuranceText('eligibleText') : getInsuranceText('notEligibleText')}
                  </p>
                </div>
              </div>

              {eligibilityData.isEligible && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">{getInsuranceText('coverageAmount')}:</span>
                      <p className="font-medium">{formatAmount(eligibilityData.coverageAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{getInsuranceText('deductible')}:</span>
                      <p className="font-medium">{formatAmount(eligibilityData.deductible)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{getInsuranceText('coPayment')}:</span>
                      <p className="font-medium">{eligibilityData.coPayment}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{getInsuranceText('policyNumber')}:</span>
                      <p className="font-medium">{eligibilityData.policyDetails?.policyNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowEligibilityCheck(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
              >
                {getInsuranceText('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

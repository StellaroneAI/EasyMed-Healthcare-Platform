import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useABHA } from '../contexts/ABHAContext';
import { familyService, FamilyMember } from '../services/familyService';

export default function FamilyManagement() {
  const { currentLanguage } = useLanguage();
  const { isABHAConnected } = useABHA();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '', relationshipType: 'SPOUSE' as FamilyMember['relationshipType'],
    dateOfBirth: '', gender: 'M' as 'M' | 'F' | 'O', mobile: '', healthId: ''
  });

  const text = currentLanguage === 'hindi'
    ? { title:'👨‍👩‍👧‍👦 पारिवारिक स्वास्थ्य प्रबंधन', subtitle:'अपने परिवार के स्वास्थ्य खाते प्रबंधित करें', add:'परिवार का सदस्य जोड़ें', none:'अभी तक कोई सदस्य नहीं जोड़ा गया', relation:'रिश्ता', name:'नाम', dob:'जन्म तिथि', gender:'लिंग', mobile:'मोबाइल नंबर', healthId:'ABHA Health ID (वैकल्पिक)', save:'सदस्य सेव करें', cancel:'रद्द करें', male:'पुरुष', female:'महिला', other:'अन्य', spouse:'पति/पत्नी', child:'बच्चा', parent:'माता-पिता', sibling:'भाई-बहन', linked:'ABHA जुड़ा है', notLinked:'ABHA जुड़ा नहीं है', link:'ABHA लिंक करें', consent:'सहमति दें', consentGiven:'सहमति दी गई' }
    : { title:'👨‍👩‍👧‍👦 Family Health Management', subtitle:'Manage health accounts for your family', add:'Add Family Member', none:'No family members added yet', relation:'Relationship', name:'Name', dob:'Date of Birth', gender:'Gender', mobile:'Mobile Number', healthId:'ABHA Health ID (Optional)', save:'Save Member', cancel:'Cancel', male:'Male', female:'Female', other:'Other', spouse:'Spouse', child:'Child', parent:'Parent', sibling:'Sibling', linked:'ABHA Linked', notLinked:'Not Linked', link:'Link ABHA', consent:'Grant Consent', consentGiven:'Consent Given' };

  const load = async () => {
    setIsLoading(true);
    try { setFamilyMembers(await familyService.list()); } catch { setFamilyMembers([]); } finally { setIsLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const add = async () => {
    if (!newMember.name || !newMember.dateOfBirth) return;
    setIsLoading(true);
    try {
      if (await familyService.add(newMember)) {
        await load(); setShowAddMember(false);
        setNewMember({ name:'', relationshipType:'SPOUSE', dateOfBirth:'', gender:'M', mobile:'', healthId:'' });
      }
    } finally { setIsLoading(false); }
  };

  const age = (dob: string) => {
    const d = new Date(dob), now = new Date();
    let value = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) value--;
    return value;
  };

  const relationship = (value: string) => ({ SPOUSE:text.spouse, CHILD:text.child, PARENT:text.parent, SIBLING:text.sibling, OTHER:'Other' } as Record<string,string>)[value] || value;

  return (
    <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-base sm:text-lg font-semibold">{text.title}</h3><p className="text-sm text-gray-600">{text.subtitle}</p></div>
        <button onClick={() => setShowAddMember(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{text.add}</button>
      </div>
      {!isABHAConnected && <p className="text-xs text-gray-500 mb-4">ABHA can be linked separately to eligible family members; family data is securely managed in EasyMed.</p>}
      {isLoading ? <div className="text-center py-8">Loading...</div> : familyMembers.length === 0 ? <div className="text-center py-8 text-gray-600">{text.none}</div> :
        <div className="space-y-3">{familyMembers.map(member => <div key={member.id} className="bg-white/50 p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">{member.gender === 'F' ? '👩' : member.gender === 'M' ? '👨' : '👤'}</div>
            <div className="min-w-0"><h4 className="font-medium truncate">{member.name}</h4><p className="text-sm text-gray-600">{relationship(member.relationshipType)} • {age(member.dateOfBirth)} years</p>
              <span className="inline-flex mt-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{member.isLinked ? text.linked : text.notLinked}</span>{member.consentGiven && <span className="inline-flex ml-2 mt-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{text.consentGiven}</span>}
            </div></div>
            <div className="flex flex-col gap-2">{!member.isLinked && member.healthId && <button disabled={isLoading} onClick={async()=>{if(await familyService.link(member.id,member.healthId)) await load();}} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">{text.link}</button>}{!member.consentGiven && <button disabled={isLoading} onClick={async()=>{if(await familyService.grantConsent(member.id)) await load();}} className="bg-purple-600 text-white px-3 py-1 rounded text-xs">{text.consent}</button>}</div>
          </div>
        </div>)}</div>}
      {showAddMember && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{text.add}</h3><div className="space-y-4">
          <input value={newMember.name} onChange={e=>setNewMember({...newMember,name:e.target.value})} className="w-full p-3 border rounded-lg" placeholder={text.name}/>
          <select value={newMember.relationshipType} onChange={e=>setNewMember({...newMember,relationshipType:e.target.value as FamilyMember['relationshipType']})} className="w-full p-3 border rounded-lg"><option value="SPOUSE">{text.spouse}</option><option value="CHILD">{text.child}</option><option value="PARENT">{text.parent}</option><option value="SIBLING">{text.sibling}</option><option value="OTHER">Other</option></select>
          <input type="date" value={newMember.dateOfBirth} onChange={e=>setNewMember({...newMember,dateOfBirth:e.target.value})} className="w-full p-3 border rounded-lg"/>
          <select value={newMember.gender} onChange={e=>setNewMember({...newMember,gender:e.target.value as 'M'|'F'|'O'})} className="w-full p-3 border rounded-lg"><option value="M">{text.male}</option><option value="F">{text.female}</option><option value="O">{text.other}</option></select>
          <input value={newMember.mobile} onChange={e=>setNewMember({...newMember,mobile:e.target.value})} className="w-full p-3 border rounded-lg" placeholder={text.mobile} maxLength={20}/>
          <input value={newMember.healthId} onChange={e=>setNewMember({...newMember,healthId:e.target.value})} className="w-full p-3 border rounded-lg" placeholder={text.healthId}/>
        </div><div className="flex gap-3 mt-6"><button onClick={()=>setShowAddMember(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">{text.cancel}</button><button onClick={()=>void add()} disabled={isLoading||!newMember.name||!newMember.dateOfBirth} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">{text.save}</button></div>
      </div></div>}
    </div>
  );
}

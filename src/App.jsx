import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  Search, 
  ArrowRight, 
  Copy, 
  Check, 
  Stethoscope, 
  RefreshCw, 
  Building2, 
  ChevronDown, 
  Gift, 
  Truck, 
  Bot, 
  Loader2, 
  X,
  Clock
} from 'lucide-react';

const POPULAR_LENSES = [
  { id: 'dt1', name: 'Dailies Total 1', brand: 'Alcon' },
  { id: 'oasys-1day', name: 'Acuvue Oasys 1-Day HydraLuxe', brand: 'Johnson & Johnson' },
  { id: 'p1', name: 'Precision1', brand: 'Alcon' },
  { id: 'oasys-2wk', name: 'Acuvue Oasys', brand: 'Johnson & Johnson' },
  { id: 'biofinity', name: 'Biofinity / Toric', brand: 'CooperVision' },
  { id: 'infuse', name: 'Bausch + Lomb INFUSE', brand: 'Bausch + Lomb' },
  { id: 'myday', name: 'MyDay', brand: 'CooperVision' },
  { id: 'clariti', name: 'clariti 1 day', brand: 'CooperVision' },
  { id: 'ultra', name: 'Bausch + Lomb ULTRA', brand: 'Bausch + Lomb' },
  { id: 'air-optix', name: 'Air Optix HydraGlyde', brand: 'Alcon' }
];

const CONCIERGE_FAQS = [
  {
    q: "How does the clinical EHR cross-reference work?",
    a: "When you provide your legal name and date of birth, our optical dispensary staff matches your electronic health record. We pull your exact prescribed parameters, brand specifications, and base curve measurements without requiring paper slips."
  },
  {
    q: "Can someone who is not a patient of your clinic use Re-Up?",
    a: "Yes. Select 'Outside / Referred Patient' on the intake form. Our clinical staff handles the prescription authentication directly with your prescribing office."
  },
  {
    q: "How does the $25 referral program work?",
    a: "When you share your personal VIP link with a friend, they receive $25 applied directly to their first Re-Up supply. In turn, a $25 optical credit is logged to your patient chart for future supplies."
  },
  {
    q: "How quickly do my lenses arrive?",
    a: "Once our optical staff verifies your parameters and texts you to confirm your address, factory-sealed boxes are dispatched directly to your door with fast, tracked shipping."
  }
];

async function callGemini(payload, retries = 3, delay = 1000) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 && i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    contactType: 'phone',
    contactValue: '',
    patientStatus: 'existing',
    hasReferralCode: false,
    referralCodeInput: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const referralCode = 'REUP-25VIP';
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // AI Concierge Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your Re-Up Clinical Assistant. You can ask me anything about your lens parameters (BC, DIA, Power), brand modalities, or how our chart lookup works. How can I help?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const handleCopyReferral = () => {
    const textToCopy = `https://reupcontacts.com/vip?gift=25&ref=${encodeURIComponent(referralCode)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dob || !formData.contactValue) return;

    setIsSubmitting(true);
    setSubmitError('');

    const mockTicket = 'RU-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await fetch('https://formspree.io/f/xaenjlqq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber: mockTicket,
          patientName: formData.fullName,
          dateOfBirth: formData.dob,
          contactMethod: formData.contactType === 'phone' ? 'Phone / SMS' : 'Email',
          contactInfo: formData.contactValue,
          patientCategory: formData.patientStatus === 'existing' ? 'Current Patient' : 'Outside Referral',
          referralCode: formData.referralCodeInput || 'None',
          submissionTimestamp: new Date().toLocaleString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Formspree delivery issue');
      }

      setSubmissionReceipt({
        id: mockTicket,
        name: formData.fullName,
        status: formData.patientStatus,
        contact: formData.contactValue,
        channel: formData.contactType === 'phone' ? 'Direct SMS' : 'Encrypted Email',
        lens: 'Confirmed via Text',
        creditApplied: formData.referralCodeInput ? '$25 Friend Credit Applied' : 'Standard Concierge Dispatch'
      });
      setFormSubmitted(true);
    } catch (err) {
      setSubmitError('Unable to send request right now. Please check your connection or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormSubmitted(false);
    setSubmitError('');
    setFormData({
      fullName: '',
      dob: '',
      contactType: 'phone',
      contactValue: '',
      patientStatus: 'existing',
      hasReferralCode: false,
      referralCodeInput: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* Discreet Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-100/60 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f025_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f025_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {}
      <header className="relative z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 font-mono">
                RE<span className="text-blue-600">-</span>UP
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline">
                Concierge
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <a 
              href="#share" 
              className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Gift className="w-3.5 h-3.5 text-blue-600" />
              <span>Give $25</span>
            </a>
            <button 
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-3 py-1.5 rounded-lg transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>Questions?</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        
        {}
        {/* Main Content Area */}
        <section className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Dedicated Contact Lens Concierge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
            Never get caught dry. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600">
              Your contact lens concierge.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Cross-referenced directly with your electronic health record. No logins, accounts, or optical pickup lines—just authentic factory lenses delivered straight to your door with fast, tracked dispatch.
          </p>
        </section>

        {/* Form Card Section */}
        <section className="max-w-xl mx-auto mb-16">
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
            
            {formSubmitted ? (
              <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">Concierge Request Received</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Ticket <span className="font-mono font-bold text-blue-700">{submissionReceipt?.id}</span> is now active with our dispensary.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2.5 font-mono">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-sans">Patient:</span>
                    <span className="font-bold">{submissionReceipt?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-sans">Verification Via:</span>
                    <span>{submissionReceipt?.channel} ({submissionReceipt?.contact})</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-sans">Lens Profile:</span>
                    <span className="truncate max-w-[200px]">{submissionReceipt?.lens}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-sans">Turnaround:</span>
                    <span className="font-sans font-bold text-slate-900">Fast, Tracked Doorstep Dispatch</span>
                  </div>
                  {submissionReceipt?.creditApplied.includes('$25') && (
                    <div className="flex justify-between text-indigo-700 pt-1 border-t border-slate-200 font-sans font-bold">
                      <span>Perk:</span>
                      <span>$25 Friend Credit Applied</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 text-left flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Our dispensary is cross-referencing your chart. Expect a text message shortly to verify your delivery address before dispatch.
                  </span>
                </div>

                <button
                  onClick={resetForm}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors pt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Submit Another Request</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Patient Category Toggle */}
                <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, patientStatus: 'existing' })}
                    className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      formData.patientStatus === 'existing'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Current Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, patientStatus: 'outside' })}
                    className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      formData.patientStatus === 'outside'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>Outside Referral</span>
                  </button>
                </div>

                {/* Name & DOB (The EHR Lookup Pair) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-600" />
                      <span>Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span>Date of Birth</span>
                      </span>
                      <span className="text-[10px] text-slate-400">(Chart Key)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Contact Method */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      {formData.contactType === 'phone' ? (
                        <Phone className="w-3 h-3 text-blue-600" />
                      ) : (
                        <Mail className="w-3 h-3 text-blue-600" />
                      )}
                      <span>Phone number</span>
                    </label>

                    <div className="flex rounded-md bg-slate-100 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, contactType: 'phone' })}
                        className={`px-2 py-0.5 rounded transition-all ${
                          formData.contactType === 'phone' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, contactType: 'email' })}
                        className={`px-2 py-0.5 rounded transition-all ${
                          formData.contactType === 'email' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>

                  <input
                    type={formData.contactType === 'phone' ? 'tel' : 'email'}
                    required
                    placeholder={formData.contactType === 'phone' ? '(555) 000-0000' : 'alex@example.com'}
                    value={formData.contactValue}
                    onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  />
                </div>

                {/* Referral Code (Clean Expandable) */}
                <div className="pt-1">
                  {!formData.hasReferralCode ? (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasReferralCode: true })}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Have a $25 friend referral code?</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter referral code"
                        value={formData.referralCodeInput}
                        onChange={(e) => setFormData({ ...formData, referralCodeInput: e.target.value.toUpperCase() })}
                        className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-3 py-2 text-xs text-indigo-950 uppercase font-mono font-bold focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, hasReferralCode: false, referralCodeInput: '' })}
                        className="text-xs text-slate-400 hover:text-slate-600 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">
                    {submitError}
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to Dispensary...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Verify &amp; Re-Up Lenses</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Confidential chart matching &bull; Fast, tracked doorstep delivery</span>
                </div>

              </form>
            )}

          </div>
        </section>

        {}
        <section className="mb-14 max-w-3xl mx-auto border-t border-slate-200/80 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3.5">
              <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/70 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Drop Basic Info</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Name and birth date. No shopping accounts or passwords needed.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/70 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">EHR Matching</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Our optical dispensary cross-references your exact prescription.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/70 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Doorstep Dispatch</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Manufacturer-sealed boxes dispatched rapidly straight to your door.</p>
              </div>
            </div>
          </div>
        </section>

        {}
        <section id="share" className="mb-14 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-600/15 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                <Gift className="w-3 h-3" />
                <span>Give $25 &bull; Get $25</span>
              </div>
              <h3 className="text-lg font-bold">Pass the Re-Up to Friends</h3>
              <p className="text-xs text-blue-100 max-w-sm leading-relaxed">
                Friends get $25 off their first order, and a $25 credit is added to your clinic chart.
              </p>
            </div>

            <button
              onClick={handleCopyReferral}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>
        </section>

        {}
        <section className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Common Questions</h3>
          </div>

          <div className="space-y-2.5">
            {CONCIERGE_FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-white border border-slate-200/80 overflow-hidden text-left"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col h-[80vh] sm:h-[520px] overflow-hidden">
            
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Re-Up Clinical Assistant</h4>
                  <span className="text-[10px] text-slate-400">Available 24/7</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfdfe] text-xs">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-3 py-2 flex items-center space-x-2 text-slate-400 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    <span>Checking clinical guide...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Ask about parameters, delivery, or brands..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discreet Floating Chat Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setChatOpen(true)}
          className="px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all hover:scale-105"
        >
          <Bot className="w-3.5 h-3.5 text-blue-400" />
          <span>Ask Assistant</span>
        </button>
      </div>

      {}
      {}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-400">
        <p className="font-bold text-slate-700 mb-1">RE-UP CONTACT LENSES</p>
        <p className="max-w-md mx-auto leading-relaxed">
          Optical dispensary concierge. Verified directly with in-house patient records. Authentic manufacturer packaging with fast, tracked doorstep delivery.
        </p>
        <p className="mt-3 text-[11px] text-slate-300">
          Practice Text Line: (555) 738-7698 &bull; &copy; {new Date().getFullYear()} Re-Up Contacts
        </p>
      </footer>

    </div>
  );
}

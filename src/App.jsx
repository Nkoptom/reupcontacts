import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Lock, ChevronDown, Eye } from 'lucide-react';

// HIPAA-compliant Jotform form (submissions go to hipaa-submit.jotform.com)
const JOTFORM_ID = '262985603964067';
const JOTFORM_URL = `https://form.jotform.com/${JOTFORM_ID}`;

const CONCIERGE_FAQS = [
  {
    q: "How does the clinical EHR cross-reference work?",
    a: "When you provide your legal name and date of birth, our optical dispensary staff matches your electronic health record. We pull your exact prescribed parameters, brand specifications, and base curve measurements without requiring paper slips."
  },
  {
    q: "Can someone who is not a patient of your clinic use Re-Up?",
    a: "Yes. Select 'New to Re-Up' on the intake form. Our clinical staff handles the prescription authentication directly with your prescribing office."
  },
  {
    q: "How quickly do my lenses arrive?",
    a: "Once our optical staff verifies your parameters and texts you to confirm your address, factory-sealed boxes are shipped directly to your door with fast shipping."
  }
];

export default function App() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formHeight, setFormHeight] = useState(560);
  const iframeRef = useRef(null);

  // Jotform posts its content height so the embedded form can resize without scrollbars.
  useEffect(() => {
    const onMessage = (e) => {
      if (!/^https:\/\/([a-z0-9-]+\.)*jotform\.com$/.test(e.origin)) return;
      if (typeof e.data !== 'string') return;
      const parts = e.data.split(':');
      if (parts[0] === 'setHeight' && parts[2] === JOTFORM_ID) {
        const h = parseInt(parts[1], 10);
        if (h > 0 && h < 5000) setFormHeight(h);
      } else if (parts[0] === 'scrollIntoView' && iframeRef.current) {
        iframeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* Discreet Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-100/60 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f025_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f025_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <header className="relative z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" aria-label="RE-UP home: start a new lens request" title="Start a new request" className="flex items-center space-x-3 rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
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
          </a>
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
            Cross-referenced directly with your electronic health record. No logins, accounts, or optical pickup lines—just authentic factory lenses delivered straight to your door with fast shipping.
          </p>
        </section>

        {/* Form Card Section */}
        <section className="max-w-xl mx-auto mb-16">
          <div className="rounded-3xl bg-white border border-slate-200/90 p-2 sm:p-4 shadow-xl shadow-slate-200/50 relative">
            
            <iframe
              ref={iframeRef}
              id={`JotFormIFrame-${JOTFORM_ID}`}
              title="Re-Up Lens Request"
              src={JOTFORM_URL}
              style={{ width: '100%', height: `${formHeight}px`, border: 'none' }}
              scrolling="no"
              allow="geolocation 'none'; camera 'none'; microphone 'none'"
              referrerPolicy="strict-origin-when-cross-origin"
            />

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-3">
              <Lock className="w-3 h-3 text-blue-600" />
              <span>Encrypted, HIPAA-compliant submission &bull; Fast doorstep delivery</span>
            </div>

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
                <h4 className="text-xs font-bold text-slate-900">Doorstep Shipping</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Manufacturer-sealed boxes shipped straight to your door.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Questions */}
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

      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-400">
        <p className="font-bold text-slate-700 mb-1">RE-UP CONTACT LENSES</p>
        <p className="max-w-md mx-auto leading-relaxed">
          Optical dispensary concierge. Verified directly with in-house patient records. Authentic manufacturer packaging with fast doorstep delivery.
        </p>
        <p className="mt-3 text-[11px] text-slate-300">
          &copy; {new Date().getFullYear()} Re-Up Contacts
        </p>
      </footer>

    </div>
  );
}

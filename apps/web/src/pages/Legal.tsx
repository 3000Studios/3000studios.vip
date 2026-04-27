import React from 'react';

export default function Legal() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="glass-card p-12 max-w-4xl mx-auto bg-black/40 backdrop-blur-3xl border-white/5">
        <span className="text-gold font-bold uppercase tracking-widest text-xs">Compliance Console</span>
        <h1 className="text-5xl font-black mb-12 text-white tracking-tighter">Legal & Regulatory Disclosure</h1>
        
        <div className="space-y-16">
          <section className="p-10 border border-red-500/30 bg-red-500/5 rounded-[2rem]">
            <h2 className="text-2xl font-bold text-red-500 mb-4">NO REFUND POLICY</h2>
            <p className="text-lg text-white font-bold leading-relaxed">
              ALL SALES ARE FINAL. 3000 STUDIOS VIP OPERATES ON A ZERO-REFUND BASIS. ONCE ACCESS IS GRANTED OR A TRANSACTION IS PROCESSED, IT IS NON-REFUNDABLE AND NON-REVERSIBLE.
            </p>
          </section>

          <section className="p-10 border border-gold/30 bg-gold/5 rounded-[2rem]">
            <h2 className="text-2xl font-bold text-gold mb-4">LIABILITY WAIVER & INDEMNITY</h2>
            <p className="text-lg text-white font-bold italic leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, 3000 STUDIOS AND ITS OPERATORS ARE NOT LIABLE FOR ANY LOSSES, DAMAGES, LEGAL CONSEQUENCES, OR DISPUTES ARISING FROM THE USE OF OUR TOOLS, API, OR GENERATED OUTPUTS. USER ASSUMES 100% RESPONSIBILITY. WE CANNOT BE HELD LIABLE FOR ANYTHING.
            </p>
          </section>

          <section className="text-white/60 space-y-6">
            <h2 className="text-2xl font-bold text-white">General Terms</h2>
            <p>This platform provides advanced operational tools and manifest engine access. Usage implies full agreement with these terms. We reserve the right to terminate access at any time for any reason without refund.</p>
            <p>All software is provided "as-is" for enterprise and individual use. Compliance with local advertising and financial regulations is the sole responsibility of the operator.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

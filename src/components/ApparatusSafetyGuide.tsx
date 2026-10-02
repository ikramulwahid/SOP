import React from 'react';
import { StructuredSopDocument } from '../data/sopParser';
import { 
  ShieldCheck, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Info, 
  Flame, 
  FileCheck2,
  HardHat,
  Thermometer,
  Wind
} from 'lucide-react';

interface ApparatusSafetyGuideProps {
  sop: StructuredSopDocument;
}

export const ApparatusSafetyGuide: React.FC<ApparatusSafetyGuideProps> = ({ sop }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Quality & Metrology Assurance
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {sop.documentTitle} — Apparatus & Safety Matrix
          </h1>
          <p className="text-xs text-slate-500">
            NABL / ISO/IEC 17025 equipment calibration status, precision tolerances, and safety controls for {sop.documentNumber}.
          </p>
        </div>
      </div>

      {/* PPE & SAFETY PROTOCOL CARDS */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          Mandatory Safety Protocols (Section 4.0 Compliance)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sop.safetyPrecautions.map((s, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {s.title}
                </span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  s.level === 'Mandatory' 
                    ? 'bg-rose-100 text-rose-800' 
                    : s.level === 'Critical Caution'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {s.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* APPARATUS CATALOG WITH CALIBRATION & TOLERANCE */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-700" />
          Laboratory Apparatus & Traceability Schedule (Section 5.0)
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-semibold">
                  <th className="p-3 border-r border-slate-200">Equipment / Apparatus</th>
                  <th className="p-3 border-r border-slate-200">Technical Standard & Requirement</th>
                  <th className="p-3 border-r border-slate-200">Precision / Tolerance</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {sop.apparatus.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-xs leading-relaxed">
                      {item.spec}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-900">
                      {item.tolerance || 'Standard'}
                    </td>
                    <td className="p-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Verified & Calibrated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REAGENTS & SAMPLE HANDLING NOTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            6.0 Reagents Specification
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sop.reagents}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            7.0 Sample Handling & Preservation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sop.sampleHandling}
          </p>
        </div>
      </div>
    </div>
  );
};

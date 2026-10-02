import React, { useState } from 'react';
import { StructuredSopDocument } from '../data/sopParser';
import { MathFormulaRenderer } from './MathFormulaRenderer';
import { 
  Printer, 
  FileText, 
  ShieldAlert, 
  Scale, 
  Wrench,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  CircleDot,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';

interface SopDocumentViewProps {
  sop: StructuredSopDocument;
  onOpenCalculator?: () => void;
  onOpenHtmlModal?: () => void;
  onOpenStudio?: () => void;
}

export const SopDocumentView: React.FC<SopDocumentViewProps> = ({ 
  sop,
  onOpenCalculator,
  onOpenHtmlModal,
  onOpenStudio
}) => {
  // Filing punch hole style
  const [punchStyle, setPunchStyle] = useState<'2-hole' | '4-hole' | '3-hole' | 'none'>('2-hole');
  const [showGutterGuide, setShowGutterGuide] = useState<boolean>(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Action bar in app (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-200">
            {sop.companyName.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {sop.documentNumber} : {sop.documentTitle}
            </h2>
            <p className="text-xs text-slate-500">
              ISO/IEC 17025 Standard Operating Procedure &bull; Rev {sop.revisionNumber} ({sop.effectiveDate})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Edit Text / Parser
            </button>
          )}

          {onOpenCalculator && (
            <button
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              Calculations
            </button>
          )}

          {onOpenHtmlModal && (
            <button
              onClick={onOpenHtmlModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Copy Standalone HTML
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print A4 / Save PDF
          </button>
        </div>
      </div>

      {/* A4 Paper Format & Filing Margin Control Strip (hidden in print) */}
      <div className="no-print bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <FolderOpen className="w-4 h-4 text-amber-700" />
            <span>A4 Portrait Document</span>
            <span className="font-mono text-[10px] text-slate-500 font-normal">(210 &times; 297 mm)</span>
          </div>

          <span className="text-slate-300">&bull;</span>

          <div className="text-[11px] text-slate-600">
            <span className="font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
              Left Filing Gutter: 28 mm
            </span>
            <span className="ml-1 text-slate-500">(Reserved for punch holes & ring binder filing)</span>
          </div>
        </div>

        {/* Punch Guide Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Hole Punch Targets:</span>
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-medium">
            <button
              onClick={() => setPunchStyle('2-hole')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                punchStyle === '2-hole' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2-Hole (80mm ISO)
            </button>
            <button
              onClick={() => setPunchStyle('4-hole')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                punchStyle === '4-hole' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4-Hole
            </button>
            <button
              onClick={() => setPunchStyle('3-hole')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                punchStyle === '3-hole' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3-Hole
            </button>
            <button
              onClick={() => setPunchStyle('none')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                punchStyle === 'none' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Off
            </button>
          </div>

          <button
            onClick={() => setShowGutterGuide(!showGutterGuide)}
            className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
              showGutterGuide 
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold' 
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            {showGutterGuide ? 'Gutter Line: On' : 'Gutter Line: Off'}
          </button>
        </div>
      </div>

      {/* DOCUMENT SHEET 1: PAGE 1 OF 2 */}
      <div className="sop-page bg-white p-8 pl-16 sm:pl-20 md:pl-24 border border-slate-300 shadow-lg rounded-sm relative text-slate-800 max-w-[210mm] min-h-[297mm] mx-auto box-border">
        {/* Controlled Watermark */}
        <div className="absolute top-24 right-10 rotate-12 pointer-events-none opacity-5 border-4 border-slate-900 rounded-md p-3 text-center">
          <div className="text-2xl font-black uppercase tracking-widest text-slate-900">CONTROLLED</div>
          <div className="text-xs font-bold tracking-wider text-slate-700">{sop.companyName.toUpperCase()} QA/QC</div>
        </div>

        {/* Vertical Filing Margin Guideline (faint dashed border at 25mm) */}
        {showGutterGuide && (
          <div 
            className="absolute top-0 bottom-0 left-12 sm:left-14 md:left-16 border-r border-dashed border-slate-300/80 pointer-events-none"
            title="Filing Margin Clearance Line (28mm)"
          >
            <div className="absolute top-3 left-1 text-[8px] font-mono text-slate-400 rotate-90 origin-top-left uppercase tracking-widest">
              FILING MARGIN
            </div>
          </div>
        )}

        {/* Physical Hole Punch Target Markers on Page 1 */}
        {punchStyle === '2-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[38%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none" title="ISO 838 Top Punch Guide (80mm)">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[62%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none" title="ISO 838 Bottom Punch Guide (80mm)">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {punchStyle === '4-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[20%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[40%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[60%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[80%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {punchStyle === '3-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[25%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[50%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[75%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {/* Formal Header Grid per ISO 17025 */}
        <div className="border-2 border-slate-900 mb-8">
          <div className="grid grid-cols-12 border-b border-slate-900">
            {/* Logo box */}
            <div className="col-span-3 p-3 border-r border-slate-900 flex flex-col items-center justify-center text-center bg-slate-50/50">
              <div className="w-12 h-12 rounded bg-amber-600 text-white flex items-center justify-center font-serif text-xl font-bold tracking-wider shadow-sm mb-1">
                {sop.companyName.slice(0, 3).toUpperCase()}
              </div>
              <div className="text-[10px] font-bold tracking-wider text-slate-800 uppercase line-clamp-1">{sop.companyName}</div>
              <div className="text-[8px] text-slate-500 font-mono">ISO 17025 ACCREDITED</div>
            </div>

            {/* Company Info */}
            <div className="col-span-6 p-3 border-r border-slate-900 flex flex-col justify-center">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                {sop.companyName}
              </h1>
              <p className="text-[11px] font-medium text-slate-600 leading-tight">
                {sop.companySubtitle}
              </p>
              <p className="text-[9px] text-slate-500 mt-1">
                {sop.companyAddress}
              </p>
            </div>

            {/* Document metadata table right column */}
            <div className="col-span-3 text-[11px] divide-y divide-slate-300">
              <div className="p-1.5 flex justify-between bg-slate-50">
                <span className="font-semibold text-slate-500">Doc No:</span>
                <span className="font-mono font-bold text-slate-900">{sop.documentNumber}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-semibold text-slate-500">Rev No:</span>
                <span className="font-mono font-bold text-slate-900">{sop.revisionNumber}</span>
              </div>
              <div className="p-1.5 flex justify-between bg-slate-50">
                <span className="font-semibold text-slate-500">Effective:</span>
                <span className="font-medium text-slate-900">{sop.effectiveDate}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-semibold text-slate-500">Page:</span>
                <span className="font-bold text-slate-900">1 of 2</span>
              </div>
            </div>
          </div>

          {/* SOP Title banner */}
          <div className="bg-slate-100 text-center py-2.5 px-4 border-b border-slate-900">
            <div className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">Standard Operating Procedure</div>
            <div className="text-lg font-black text-slate-900 tracking-wide uppercase font-serif-doc mt-0.5">
              {sop.documentTitle}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Method Standard: {sop.isoStandard}
            </div>
          </div>

          {/* Department row */}
          <div className="grid grid-cols-12 text-[11px] bg-slate-50/70 p-2">
            <div className="col-span-8">
              <span className="font-semibold text-slate-600">Department: </span>
              <span className="text-slate-900 font-medium">{sop.department}</span>
            </div>
            <div className="col-span-4 text-right">
              <span className="font-semibold text-slate-600">Next Review: </span>
              <span className="text-slate-900 font-medium">{sop.reviewDate}</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: PURPOSE */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">1.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Purpose</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            {sop.purpose}
          </p>
        </section>

        {/* SECTION 2: SCOPE */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">2.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Scope</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            {sop.scope}
          </p>
        </section>

        {/* SECTION 3: DEFINITIONS & ABBREVIATIONS */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">3.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Definitions and Abbreviations</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            {sop.definitions.map((def, idx) => (
              <p key={idx}>
                <strong className="text-slate-900">{def.term}: </strong>
                {def.definition}
              </p>
            ))}
          </div>
        </section>

        {/* SECTION 4: SAFETY PRECAUTIONS */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">4.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Safety Precautions</h2>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded p-3 mb-2">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Mandatory Safety Protocols & Personal Protective Equipment (PPE)
            </div>
            <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
              {sop.safetyPrecautions.map((safe, idx) => (
                <li key={idx}>
                  <strong>{safe.title} ({safe.level}): </strong>
                  {safe.desc}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION 5: APPARATUS */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">5.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Apparatus & Equipment</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 w-1/4">Apparatus</th>
                  <th className="p-2 border-r border-slate-300 w-1/2">Standard Specification / Requirement</th>
                  <th className="p-2 w-1/4">Precision / Tolerance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {sop.apparatus.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 border-r border-slate-200 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-[11px] leading-tight">
                      {item.spec}
                    </td>
                    <td className="p-2 font-mono text-[11px] text-slate-600">
                      {item.tolerance || 'Standard'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: REAGENTS */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">6.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Reagents</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {sop.reagents}
          </p>
        </section>

        {/* SECTION 7: SAMPLE HANDLING AND PREPARATION */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">7.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Sample Handling and Preparation</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            {sop.sampleHandling}
          </p>
        </section>

        {/* STAGE 1 PROCEDURE (if multi-stage) */}
        {sop.procedureStages.length > 0 && (
          <section className="mb-4">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">8.0</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Procedure: 8.1 {sop.procedureStages[0].stageName}
              </h2>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {sop.procedureStages[0].steps.map((s, stepIdx) => (
                <div key={`stage-0-step-${s.step}-${stepIdx}`} className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-slate-900 text-[11px] min-w-5 pt-0.5">
                    8.1.{s.step}
                  </span>
                  <p className="leading-tight">
                    <strong className="text-slate-900">{s.title}: </strong>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Page 1 Footer */}
        <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>{sop.companyName} | Quality Assurance System</span>
          <span>Document No: {sop.documentNumber} | Page 1 of 2</span>
        </div>
      </div>

      {/* DOCUMENT SHEET 2: PAGE 2 OF 2 */}
      <div className="sop-page bg-white p-8 pl-16 sm:pl-20 md:pl-24 border border-slate-300 shadow-lg rounded-sm relative text-slate-800 max-w-[210mm] min-h-[297mm] mx-auto box-border">
        {/* Vertical Filing Margin Guideline on Page 2 */}
        {showGutterGuide && (
          <div 
            className="absolute top-0 bottom-0 left-12 sm:left-14 md:left-16 border-r border-dashed border-slate-300/80 pointer-events-none"
            title="Filing Margin Clearance Line (28mm)"
          >
            <div className="absolute top-3 left-1 text-[8px] font-mono text-slate-400 rotate-90 origin-top-left uppercase tracking-widest">
              FILING MARGIN
            </div>
          </div>
        )}

        {/* Physical Hole Punch Target Markers on Page 2 */}
        {punchStyle === '2-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[38%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none" title="ISO 838 Top Punch Guide (80mm)">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[62%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none" title="ISO 838 Bottom Punch Guide (80mm)">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {punchStyle === '4-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[20%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[40%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[60%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[80%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {punchStyle === '3-hole' && (
          <>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[25%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[50%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="absolute left-5 sm:left-6 md:left-7 top-[75%] -translate-y-1/2 w-4 h-4 rounded-full border border-dashed border-slate-400/80 flex items-center justify-center opacity-60 pointer-events-none">
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </>
        )}

        {/* Page 2 Header mini-bar */}
        <div className="border border-slate-900 p-2 mb-6 bg-slate-50/70 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-slate-900">{sop.companyName}</span>
            <span className="text-slate-500 ml-2">| Quality SOP Document</span>
          </div>
          <div className="font-mono text-[11px] space-x-3">
            <span>Doc No: <strong>{sop.documentNumber}</strong></span>
            <span>Rev: <strong>{sop.revisionNumber}</strong></span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-300">Page 2 of 2</span>
          </div>
        </div>

        {/* STAGE 2 & SUBSEQUENT STAGES */}
        {sop.procedureStages.slice(1).map((stage, stageIdx) => (
          <section key={`stage-${stageIdx + 1}`} className="mb-6">
            <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 bg-slate-100 p-1.5 border-l-4 border-amber-600">
              8.{stageIdx + 2} {stage.stageName}
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              {stage.steps.map((s, stepIdx) => (
                <div key={`stage-${stageIdx + 1}-step-${s.step}-${stepIdx}`} className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-slate-900 text-[11px] min-w-5 pt-0.5">
                    8.{stageIdx + 2}.{s.step}
                  </span>
                  <p className="leading-tight">
                    <strong className="text-slate-900">{s.title}: </strong>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* SECTION 9: CALCULATIONS */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">9.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Calculations & Mathematical Formulations</h2>
          </div>

          <div className="space-y-3">
            {sop.calculations.map((calc, cIdx) => (
              <div key={cIdx} className="border border-slate-300 rounded p-3.5 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2 flex justify-between">
                  <span>9.{cIdx + 1} {calc.name}</span>
                  <span className="font-mono text-[10px] text-amber-700 font-semibold">Mathematical Formula</span>
                </div>
                <MathFormulaRenderer formula={calc.formula} />
                {calc.variables && calc.variables.length > 0 && (
                  <ul className="text-[11px] text-slate-600 space-y-0.5 mt-2">
                    {calc.variables.map((v, vIdx) => (
                      <li key={vIdx}>
                        <strong>{v.symbol}: </strong>
                        {v.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 10: REFERENCES */}
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">10.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">References & Standards</h2>
          </div>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            {sop.references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ul>
        </section>

        {/* SECTION 11: DOCUMENT AUTHORIZATION */}
        <section className="mb-2">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-3">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">11.0</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Authorization & Signatories</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 border border-slate-300 p-2 bg-slate-50/50">
            {sop.signatories.map((sig, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {sig.role}
                </div>
                <div className="h-10 flex items-center justify-center font-serif italic text-lg text-blue-900 font-bold border-b border-dashed border-slate-300 mx-2">
                  {sig.name}
                </div>
                <div className="font-bold text-xs text-slate-900 mt-1.5">{sig.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{sig.designation}</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">Date: {sig.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Page 2 Footer */}
        <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>{sop.companyName} | Controlled Quality Manual</span>
          <span>Document No: {sop.documentNumber} | Page 2 of 2 (End of SOP)</span>
        </div>
      </div>
    </div>
  );
};

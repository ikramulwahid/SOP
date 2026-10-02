import React, { useState } from 'react';
import { 
  StructuredSopDocument, 
  parseRawSopText, 
  LAB_TEMPLATES_CATALOG,
  INITIAL_USER_RAW_TEXT 
} from '../data/sopParser';
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Scale, 
  Layers, 
  BookOpen, 
  Wrench,
  HelpCircle,
  Zap,
  FlaskConical,
  Droplets,
  Pill,
  Flame,
  Milk,
  Building2
} from 'lucide-react';

interface SopBuilderStudioProps {
  currentSop: StructuredSopDocument;
  onUpdateSop: (sop: StructuredSopDocument) => void;
  onNavigateToView: () => void;
}

export const SopBuilderStudio: React.FC<SopBuilderStudioProps> = ({
  currentSop,
  onUpdateSop,
  onNavigateToView
}) => {
  const [inputText, setInputText] = useState(INITIAL_USER_RAW_TEXT);
  const [selectedTemplateId, setSelectedTemplateId] = useState('coal_moisture');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Local instant parse
  const handleInstantParse = () => {
    try {
      const parsed = parseRawSopText(inputText);
      onUpdateSop(parsed);
      setStatusMessage({
        type: 'success',
        text: `Parsed "${parsed.documentTitle}" (${parsed.documentNumber}) — Extracted ${parsed.procedureStages.reduce((acc, s) => acc + s.steps.length, 0)} steps, ${parsed.apparatus.length} apparatus items, and ${parsed.calculations.length} formula definitions!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Parsing error: ${err.message || 'Could not parse text.'}`
      });
    }
  };

  // AI-powered enhancement using server endpoint with Gemini 3.8 Flash
  const handleAiEnhance = async () => {
    setIsEnhancing(true);
    setStatusMessage({
      type: 'info',
      text: 'Structuring and formatting the supplied SOP material into an editable document draft...'
    });

    try {
      const res = await fetch('/api/enhance-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server error while processing with AI.');
      }

      onUpdateSop(data.sop);
      setStatusMessage({
        type: 'success',
        text: `AI suggestion prepared for "${data.sop.documentTitle}". Review the result before use.`
      });
    } catch (err: any) {
      console.warn('AI enhancement fallback to local parser:', err);
      const parsed = parseRawSopText(inputText);
      onUpdateSop(parsed);
      setStatusMessage({
        type: 'info',
        text: `Processed via local parsing engine: "${parsed.documentTitle}". (${err.message})`
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const t = LAB_TEMPLATES_CATALOG.find(item => item.id === templateId);
    if (t) {
      setSelectedTemplateId(templateId);
      setInputText(t.text);
      const parsed = parseRawSopText(t.text);
      onUpdateSop(parsed);
      setStatusMessage({
        type: 'info',
        text: `Loaded ${t.domain} standard template: "${t.title}" (${t.docNo}).`
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setStatusMessage(null);
  };

  // Calculate live detection stats from current text
  const stepCount = (inputText.match(/^\s*\d+\.\s+/gm) || []).length;
  const headingCount = (inputText.match(/^#{1,3}\s+/gm) || []).length;
  const formulaCount = (inputText.match(/(\$\$|\\frac|=)/g) || []).length;
  const charCount = inputText.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Studio Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            SOP Builder
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Create SOPs from your source material
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Paste source material or draft notes to produce an editable SOP document. The tool does not add regulatory or laboratory-specific claims.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToView}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            View Formatted SOP Document &rarr;
          </button>
        </div>
      </div>

      {/* Multi-Domain Template Catalog Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-700" />
            Select Domain SOP Template or Start from Scratch
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear Text Editor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {LAB_TEMPLATES_CATALOG.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {tpl.domain}
                    </span>
                    {tpl.id === 'coal_moisture' && <Flame className="w-3.5 h-3.5 text-amber-600" />}
                    {tpl.id === 'water_bod' && <Droplets className="w-3.5 h-3.5 text-cyan-600" />}
                    {tpl.id === 'chemistry_titration' && <FlaskConical className="w-3.5 h-3.5 text-blue-600" />}
                    {tpl.id === 'pharma_assay' && <Pill className="w-3.5 h-3.5 text-emerald-600" />}
                    {tpl.id === 'dairy_fat' && <Milk className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">
                    {tpl.title}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{tpl.docNo}</span>
                  <span className="text-amber-800 font-semibold">{isSelected ? 'Active' : 'Load'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : statusMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={onNavigateToView}
            className="text-[11px] font-bold underline ml-4 hover:opacity-80 shrink-0 cursor-pointer"
          >
            Open Formatted Document &rarr;
          </button>
        </div>
      )}

      {/* Main Two-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Text Input Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Laboratory SOP Text Input</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Markdown / Plain Text</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{charCount} chars</span>
              <span>&bull;</span>
              <span>{stepCount} steps detected</span>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your standard operating procedure text here... (e.g. # Organization Name, Document No.: ..., ## Purpose, ## Scope, ## Apparatus, ## Procedure, ## Calculation, ## References, etc.)"
            rows={20}
            className="w-full flex-1 p-3.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-y leading-relaxed text-slate-800"
          />

          {/* Builder Action Buttons */}
          <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleInstantParse}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instant Parse & Build SOP
            </button>

            <button
              onClick={handleAiEnhance}
              disabled={isEnhancing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Structuring with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Assist
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Active Document Structure Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Document Metadata */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Active Document Metadata</span>
              <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {currentSop.documentNumber}
              </span>
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Title</span>
                <span className="font-bold text-slate-900 text-sm leading-tight block">{currentSop.documentTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[9px] uppercase">Rev:</span>
                  <span className="font-bold text-slate-800">{currentSop.revisionNumber}</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[9px] uppercase">Effective:</span>
                  <span className="font-medium text-slate-800">{currentSop.effectiveDate}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Laboratory / Organization</span>
                <span className="font-bold text-slate-900 block">{currentSop.companyName}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{currentSop.department}</span>
              </div>
            </div>
          </div>

          {/* Parsed Modules & Structure Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Parsed Laboratory Modules ({currentSop.procedureStages.length} Stages)
            </h3>

            <div className="space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
              {currentSop.procedureStages.map((stage, idx) => (
                <div key={idx} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60">
                  <div className="flex justify-between items-center font-semibold text-slate-900">
                    <span>Stage {idx + 1}: {stage.stageName}</span>
                    <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                      {stage.steps.length} steps
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {stage.steps.map(s => `Step ${s.step}: ${s.title}`).join(' · ')}
                  </div>
                </div>
              ))}

              <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-medium text-slate-800">Equipment Catalog</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                  {currentSop.apparatus.length} items
                </span>
              </div>

              <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-medium text-slate-800">Formulas & Calculations</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {currentSop.calculations.length} formulas
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToView}
              className="mt-4 w-full py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              Open Full SOP Document
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

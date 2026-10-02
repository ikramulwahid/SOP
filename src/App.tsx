import React, { useState } from 'react';
import { SopBuilderStudio } from './components/SopBuilderStudio';
import { SopDocumentView } from './components/SopDocumentView';
import { InteractiveCalculator } from './components/InteractiveCalculator';
import { LabChecklistTimer } from './components/LabChecklistTimer';
import { ApparatusSafetyGuide } from './components/ApparatusSafetyGuide';
import { SopFieldEditor } from './components/SopFieldEditor';
import { RawHtmlExportModal } from './components/RawHtmlExportModal';
import { 
  StructuredSopDocument, 
  parseRawSopText, 
  INITIAL_USER_RAW_TEXT 
} from './data/sopParser';
import { 
  FileText, 
  Calculator, 
  ListChecks, 
  Wrench, 
  Printer, 
  Code2, 
  PlusCircle,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

export default function App() {
  // Initialize with parsed initial prompt text (or selected template)
  const [activeSop, setActiveSop] = useState<StructuredSopDocument>(() => 
    parseRawSopText(INITIAL_USER_RAW_TEXT)
  );

  const [currentTab, setCurrentTab] = useState<'builder' | 'sop' | 'calculator' | 'checklist' | 'apparatus' | 'editor'>('builder');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* Top Application Bar (hidden during printing) */}
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Laboratory Brand Block */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-600 flex items-center justify-center font-serif text-white font-extrabold text-lg shadow-inner">
                {activeSop.companyName.slice(0, 3).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white tracking-tight line-clamp-1">
                    {activeSop.companyName}
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                    ISO/IEC 17025
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="line-clamp-1">{activeSop.documentTitle}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="font-mono text-amber-400/90 shrink-0">{activeSop.documentNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Print / Raw HTML) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('builder')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                title="Create or load SOP from text input"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-900" />
                <span>New / Load SOP</span>
              </button>

              <button
                onClick={() => setIsHtmlModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="View & Download Standalone HTML file"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Export HTML</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Print or Save official PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCurrentTab('builder')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'builder'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              SOP Text Builder & Studio
            </button>

            <button
              onClick={() => setCurrentTab('sop')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'sop'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Official SOP Document
            </button>

            <button
              onClick={() => setCurrentTab('editor')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Visual Field Editor
            </button>

            <button
              onClick={() => setCurrentTab('calculator')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'calculator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculation Workbench
            </button>

            <button
              onClick={() => setCurrentTab('checklist')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'checklist'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              Bench Protocol & Timers
            </button>

            <button
              onClick={() => setCurrentTab('apparatus')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'apparatus'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Apparatus & Safety Matrix
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'builder' && (
          <SopBuilderStudio 
            currentSop={activeSop}
            onUpdateSop={(updated) => setActiveSop(updated)}
            onNavigateToView={() => setCurrentTab('sop')}
          />
        )}

        {currentTab === 'sop' && (
          <SopDocumentView 
            sop={activeSop}
            onOpenCalculator={() => setCurrentTab('calculator')}
            onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
            onOpenStudio={() => setCurrentTab('builder')}
          />
        )}

        {currentTab === 'editor' && (
          <SopFieldEditor 
            sop={activeSop}
            onSaveSop={(updated) => setActiveSop(updated)}
            onNavigateToView={() => setCurrentTab('sop')}
          />
        )}

        {currentTab === 'calculator' && (
          <InteractiveCalculator sop={activeSop} />
        )}

        {currentTab === 'checklist' && (
          <LabChecklistTimer sop={activeSop} />
        )}

        {currentTab === 'apparatus' && (
          <ApparatusSafetyGuide sop={activeSop} />
        )}
      </main>

      {/* Dynamic Standalone HTML Code Modal */}
      <RawHtmlExportModal 
        isOpen={isHtmlModalOpen} 
        onClose={() => setIsHtmlModalOpen(false)} 
        sop={activeSop}
      />

      {/* Application Footer (hidden in print) */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-sm">
              {activeSop.companyName}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Standard Operating Procedure: <span className="font-mono text-amber-400">{activeSop.documentNumber}</span> (Rev {activeSop.revisionNumber}) &bull; Effective: {activeSop.effectiveDate}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Universal Laboratory SOP Builder &bull; Compliant with ISO/IEC 17025:2017 & Standard Test Methods.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsHtmlModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 cursor-pointer"
            >
              Export Standalone HTML
            </button>
            <span className="text-slate-700">&bull;</span>
            <button
              onClick={() => window.print()}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-500">NABL & ISO 17025 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

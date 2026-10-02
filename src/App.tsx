import React, { useState } from 'react';
import { SopBuilderStudio } from './components/SopBuilderStudio';
import { SopDocumentView } from './components/SopDocumentView';
import { SopFieldEditor } from './components/SopFieldEditor';
import { RawHtmlExportModal } from './components/RawHtmlExportModal';
import { StructuredSopDocument, parseRawSopText } from './data/sopParser';
import { FileText, Code2, PlusCircle, Sliders, Sparkles, Printer } from 'lucide-react';

export default function App() {
  const [activeSop, setActiveSop] = useState<StructuredSopDocument>(() => parseRawSopText(''));
  const [currentTab, setCurrentTab] = useState<'builder' | 'sop' | 'editor'>('builder');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const documentLabel = activeSop.documentTitle || 'Untitled SOP';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-950">SOP</div>
              <div className="min-w-0"><div className="font-bold text-sm sm:text-base truncate">SOP Builder</div><div className="text-[11px] text-slate-400 truncate">{documentLabel}{activeSop.documentNumber ? ' · ' + activeSop.documentNumber : ''}</div></div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setCurrentTab('builder')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg"><PlusCircle className="w-3.5 h-3.5" /> New / Load</button>
              <button onClick={() => setIsHtmlModalOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg border border-slate-700"><Code2 className="w-3.5 h-3.5 text-amber-400" /> HTML</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg"><Printer className="w-3.5 h-3.5" /><span className="hidden sm:inline">Print / PDF</span></button>
            </div>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 text-xs">
            <button onClick={() => setCurrentTab('builder')} className={"px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 whitespace-nowrap " + (currentTab === 'builder' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800')}><Sparkles className="w-3.5 h-3.5" /> Build / Import</button>
            <button onClick={() => setCurrentTab('sop')} className={"px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 whitespace-nowrap " + (currentTab === 'sop' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800')}><FileText className="w-3.5 h-3.5" /> Preview</button>
            <button onClick={() => setCurrentTab('editor')} className={"px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 whitespace-nowrap " + (currentTab === 'editor' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800')}><Sliders className="w-3.5 h-3.5" /> Fields</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'builder' && <SopBuilderStudio currentSop={activeSop} onUpdateSop={setActiveSop} onNavigateToView={() => setCurrentTab('sop')} />}
        {currentTab === 'sop' && <SopDocumentView sop={activeSop} onOpenHtmlModal={() => setIsHtmlModalOpen(true)} onOpenStudio={() => setCurrentTab('builder')} />}
        {currentTab === 'editor' && <SopFieldEditor sop={activeSop} onSaveSop={setActiveSop} onNavigateToView={() => setCurrentTab('sop')} />}
      </main>
      <RawHtmlExportModal isOpen={isHtmlModalOpen} onClose={() => setIsHtmlModalOpen(false)} sop={activeSop} />
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2"><span>SOP Builder · Single-user document authoring</span><div className="flex items-center gap-3"><button onClick={() => setIsHtmlModalOpen(true)} className="text-amber-400 underline">Export HTML</button><span>·</span><button onClick={() => window.print()}>Print / Save PDF</button></div></div></footer>
    </div>
  );
}

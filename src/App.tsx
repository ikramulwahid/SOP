import React, { useMemo, useState } from 'react';
import { Eye, FileText, PlusCircle } from 'lucide-react';
import { createEmptySOPDocument, serializeSOPDocument, type SOPDocument } from './model/sopDocument';
import { SopEditorWorkspace } from './components/editor/SopEditorWorkspace';
import { SopDocumentFileActions } from './components/editor/SopDocumentFileActions';
import { SopPreviewDialog } from './components/preview/SopPreviewDialog';
import { SopDocxExport } from './components/editor/SopDocxExport';
import { SopPrintExport } from './components/print/SopPrintExport';

export default function App() {
  const [initialDocument] = useState<SOPDocument>(() => createEmptySOPDocument());
  const [document, setDocument] = useState<SOPDocument>(initialDocument);
  const [baseline, setBaseline] = useState(() => serializeSOPDocument(initialDocument));
  const [sourceFilename, setSourceFilename] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const dirty = useMemo(() => {
    try {
      return serializeSOPDocument(document) !== baseline;
    } catch {
      return true;
    }
  }, [document, baseline]);

  const handleNewDocument = () => {
    if (dirty && !window.confirm('Start a new SOP and discard current in-memory changes?')) return;
    const next = createEmptySOPDocument();
    setDocument(next);
    setBaseline(serializeSOPDocument(next));
    setSourceFilename('');
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-400 text-xs font-black text-slate-900">SOP</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold">
                <FileText className="h-4 w-4 text-amber-600" />
                <span>SOP Builder</span>
              </div>
              <div className="truncate text-xs text-slate-500">
                {document.metadata.title || 'Untitled SOP'}
                {document.metadata.documentNumber ? ' · ' + document.metadata.documentNumber : ''}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={'hidden rounded-full px-2 py-1 text-[11px] font-semibold sm:inline-flex ' + (
                dirty ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
              )}
              role="status"
            >
              {dirty ? 'Unsaved changes' : 'No changes'}
            </span>
            <button
              type="button"
              onClick={handleNewDocument}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <PlusCircle className="h-3.5 w-3.5" /> New
            </button>
            <SopDocumentFileActions
              document={document}
              dirty={dirty}
              onOpenDocument={(next, filename) => {
                if (dirty && !window.confirm('Open a different SOP and discard current unsaved changes?')) return false;
                setDocument(next);
                setBaseline(serializeSOPDocument(next));
                setSourceFilename(filename);
                setShowPreview(false);
                return true;
              }}
              onSaved={filename => {
                setBaseline(serializeSOPDocument(document));
                setSourceFilename(filename);
              }}
            />
            <SopDocxExport document={document} dirty={dirty} />
            <SopPrintExport document={document} dirty={dirty} />
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Open SOP preview"
              title="Open read-only SOP preview"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-4">
        <SopEditorWorkspace document={document} onChange={setDocument} />
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-[11px] text-slate-500">
        Single-user SOP authoring workspace · local .sop.json files
      </footer>
      {showPreview && (
        <SopPreviewDialog document={document} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

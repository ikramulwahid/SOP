import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileOutput, X } from 'lucide-react';
import type { SOPDocument } from '../../model/sopDocument';
import { validateSOPDocument } from '../../model/sopDocument';
import { buildSOPPrintFilename, SopDocumentPrint } from './SopDocumentPrint';

interface Props {
  document: SOPDocument;
  dirty: boolean;
}

export const SopPrintExport: React.FC<Props> = ({ document, dirty }) => {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-label="Open SOP print and PDF export"
        title="Print the current SOP or save it as PDF"
      >
        <FileOutput className="h-3.5 w-3.5" /> Print / PDF
      </button>
    );
  }

  const close = () => setOpen(false);
  const valid = validateSOPDocument(document).valid;

  const print = () => {
    const previousTitle = globalThis.document.title;
    const filename = buildSOPPrintFilename(document);
    const suggestedTitle = filename.replace(/\.pdf$/i, '');

    const restoreTitle = () => {
      globalThis.document.title = previousTitle;
      globalThis.removeEventListener('afterprint', restoreTitle);
    };

    globalThis.document.title = suggestedTitle;
    globalThis.addEventListener('afterprint', restoreTitle, { once: true });
    globalThis.window.print();
  };

  const dialog = (
    <div
      id="sop-print-dialog"
      className="fixed inset-0 z-50 overflow-auto bg-slate-900/40 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sop-print-dialog-title"
    >
      <div className="mx-auto flex min-h-full max-w-[1200px] flex-col rounded-xl bg-slate-100 shadow-2xl">
        <header id="sop-print-screen" className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <h2 id="sop-print-dialog-title" className="text-sm font-semibold text-slate-900">
              Print / Save as PDF
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Uses the current in-memory SOP{dirty ? ' · unsaved changes included' : ''}.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Close print preview"
            >
              <X className="h-3.5 w-3.5" /> Close
            </button>
            <button
              type="button"
              onClick={print}
              disabled={!valid}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              Print / Save PDF
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <SopDocumentPrint document={document} />
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, globalThis.document.body);
};

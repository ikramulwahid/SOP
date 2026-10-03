import React, { useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import type { SOPDocument } from '../../model/sopDocument';
import { SopDocumentPreview } from './SopDocumentPreview';

interface Props {
  document: SOPDocument;
  onClose: () => void;
}

export const SopPreviewDialog: React.FC<Props> = ({ document, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 p-2 sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sop-preview-dialog-title"
        className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-xl bg-slate-100 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <h2 id="sop-preview-dialog-title" className="text-sm font-semibold text-slate-900">SOP preview</h2>
            <p className="truncate text-xs text-slate-500">Read-only preview · the current document is not modified</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#sop-preview-dialog-title"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <ArrowUp className="h-3.5 w-3.5" /> Top
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Close SOP preview"
              title="Close preview"
            >
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-4">
          <SopDocumentPreview document={document} />
        </div>
      </div>
    </div>
  );
};

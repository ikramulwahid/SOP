import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import type { SOPDocument } from '../../model/sopDocument';
import { downloadSOPDocxDocument } from '../../model/sopDocumentDocx';

interface Props {
  document: SOPDocument;
  dirty: boolean;
}

export const SopDocxExport: React.FC<Props> = ({ document, dirty }) => {
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleExport = async () => {
    if (busy) return;

    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const filename = await downloadSOPDocxDocument(document);
      setStatusMessage('Exported ' + filename + (dirty ? ' · unsaved changes included' : ''));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The SOP could not be exported to DOCX.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-label={busy ? 'Exporting SOP to DOCX' : 'Export SOP to DOCX'}
        title="Download the current SOP as a Word document"
      >
        <FileDown className="h-3.5 w-3.5" />
        {busy ? 'Exporting…' : 'Export DOCX'}
      </button>
      {(statusMessage || errorMessage) && (
        <div
          className={errorMessage
            ? 'max-w-xs text-right text-[11px] text-rose-700'
            : 'max-w-xs text-right text-[11px] text-slate-500'}
          role={errorMessage ? 'alert' : 'status'}
          aria-live="polite"
        >
          {errorMessage || statusMessage}
        </div>
      )}
    </div>
  );
};

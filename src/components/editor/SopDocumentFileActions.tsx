import React, { useRef, useState } from 'react';
import { FolderOpen, Save } from 'lucide-react';
import type { SOPDocument } from '../../model/sopDocument';
import { downloadSOPDocument, readSOPDocumentFile } from '../../model/sopDocumentFile';

interface Props {
  document: SOPDocument;
  dirty: boolean;
  onOpenDocument: (document: SOPDocument, sourceFilename: string) => boolean;
  onSaved: (filename: string) => void;
}

export const SopDocumentFileActions: React.FC<Props> = ({
  document,
  dirty,
  onOpenDocument,
  onSaved
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = () => {
    try {
      const filename = downloadSOPDocument(document);
      setErrorMessage('');
      setStatusMessage('Saved ' + filename);
      onSaved(filename);
    } catch (error) {
      setStatusMessage('');
      setErrorMessage(error instanceof Error ? error.message : 'The SOP could not be saved.');
    }
  };

  const handleOpen = () => {
    setErrorMessage('');
    setStatusMessage('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const loadedDocument = await readSOPDocumentFile(file);
      if (onOpenDocument(loadedDocument, file.name)) {
        setErrorMessage('');
        setStatusMessage('Opened ' + file.name);
      }
    } catch (error) {
      setStatusMessage('');
      setErrorMessage(error instanceof Error ? error.message : 'The selected SOP file could not be opened.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <FolderOpen className="h-3.5 w-3.5" /> Open
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
          aria-label={dirty ? 'Save SOP with unsaved changes' : 'Save SOP'}
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sop.json,.json,application/json"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Choose an SOP file to open"
        />
      </div>

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

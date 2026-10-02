import React from 'react';
import type { SOPDocumentMetadata } from '../../model/sopDocument';

interface Props {
  metadata: SOPDocumentMetadata;
  onChange: (patch: Partial<SOPDocumentMetadata>) => void;
}

const fieldClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

export const SopMetadataEditor: React.FC<Props> = ({ metadata, onChange }) => {
  const fields: Array<{
    key: keyof SOPDocumentMetadata;
    label: string;
    type?: string;
    className?: string;
  }> = [
    { key: 'title', label: 'Title', className: 'md:col-span-2' },
    { key: 'documentNumber', label: 'Document Number' },
    { key: 'revision', label: 'Revision' },
    { key: 'effectiveDate', label: 'Effective Date', type: 'date' },
    { key: 'reviewDate', label: 'Review Date', type: 'date' },
    { key: 'organization', label: 'Organization' },
    { key: 'department', label: 'Department' }
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="document-metadata-heading">
      <div className="mb-4">
        <h2 id="document-metadata-heading" className="text-sm font-semibold text-slate-900">Document metadata</h2>
        <p className="mt-1 text-xs text-slate-500">Editable descriptive fields from the generic SOP document model.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map(field => (
          <label key={field.key} className={field.className}>
            <span className="mb-1 block text-xs font-medium text-slate-700">{field.label}</span>
            <input
              type={field.type ?? 'text'}
              value={metadata[field.key]}
              onChange={event => onChange({ [field.key]: event.target.value })}
              className={fieldClass}
            />
          </label>
        ))}
      </div>
    </section>
  );
};

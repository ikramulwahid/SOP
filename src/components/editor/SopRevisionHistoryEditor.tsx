import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SOPRevisionEntry } from '../../model/sopDocument';

interface Props {
  entries: SOPRevisionEntry[];
  onChange: (entries: SOPRevisionEntry[]) => void;
}

const inputClass = 'w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const emptyEntry = (): SOPRevisionEntry => ({
  revision: '',
  date: '',
  description: '',
  preparedBy: '',
  approvedBy: ''
});

export const SopRevisionHistoryEditor: React.FC<Props> = ({ entries, onChange }) => {
  const update = (index: number, patch: Partial<SOPRevisionEntry>) => {
    const next = entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, ...patch } : entry
    );
    onChange(next);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="revision-history-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="revision-history-heading" className="text-sm font-semibold text-slate-900">Revision history</h2>
          <p className="mt-1 text-xs text-slate-500">Descriptive history only; this is not an approval or signature workflow.</p>
        </div>
        <button type="button" onClick={() => onChange([...entries, emptyEntry()])} className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
          <Plus className="h-3.5 w-3.5" /> Add entry
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">No revision-history entries.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 md:grid-cols-[110px_150px_1fr_180px_180px]">
                <label>
                  <span className="mb-1 block text-[11px] font-medium text-slate-700">Revision</span>
                  <input value={entry.revision} onChange={e => update(index, { revision: e.target.value })} className={inputClass} />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-medium text-slate-700">Date</span>
                  <input type="date" value={entry.date} onChange={e => update(index, { date: e.target.value })} className={inputClass} />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-medium text-slate-700">Description</span>
                  <input value={entry.description} onChange={e => update(index, { description: e.target.value })} className={inputClass} />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-medium text-slate-700">Prepared By</span>
                  <input value={entry.preparedBy} onChange={e => update(index, { preparedBy: e.target.value })} className={inputClass} />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-medium text-slate-700">Approved By</span>
                  <input value={entry.approvedBy} onChange={e => update(index, { approvedBy: e.target.value })} className={inputClass} />
                </label>
              </div>
              <button
                type="button"
                onClick={() => onChange(entries.filter((_, entryIndex) => entryIndex !== index))}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600"
                aria-label={'Delete revision history entry ' + (index + 1)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete entry
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

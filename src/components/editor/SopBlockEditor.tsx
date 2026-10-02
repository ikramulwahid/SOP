import React from 'react';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import type { HeadingBlock, ListBlock, SOPAsset, SOPBlock, TableBlock } from '../../model/sopDocument';
import { SopTableEditor } from './SopTableEditor';

interface Props {
  index: number;
  block: SOPBlock;
  assets: SOPAsset[];
  onChange: (block: SOPBlock) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
}

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';
const textareaClass = inputClass + ' min-h-24 resize-y';

function blockTitle(block: SOPBlock): string {
  switch (block.type) {
    case 'paragraph': return 'Paragraph';
    case 'heading': return 'Heading H' + block.level;
    case 'orderedList': return 'Ordered list';
    case 'bulletList': return 'Bullet list';
    case 'table': return 'Table';
    case 'image': return 'Image';
    case 'formula': return 'Formula';
    case 'callout': return 'Callout · ' + block.variant;
    case 'pageBreak': return 'Page break';
  }
}

export const SopBlockEditor: React.FC<Props> = ({
  index,
  block,
  assets,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
  isFirst,
  isLast,
  onSelect
}) => {
  const updateListItem = (list: ListBlock, itemIndex: number, value: string) => {
    const items = [...list.items];
    items[itemIndex] = value;
    onChange({ ...list, items });
  };

  const addListItem = (list: ListBlock) => {
    onChange({ ...list, items: [...list.items, ''] });
  };

  const removeListItem = (list: ListBlock, itemIndex: number) => {
    onChange({ ...list, items: list.items.filter((_, i) => i !== itemIndex) });
  };

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm focus-within:border-amber-300"
      onFocus={onSelect}
      aria-label={'Block ' + (index + 1) + ': ' + blockTitle(block)}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {blockTitle(block)}
          </span>
          <span className="text-[10px] text-slate-400">Block {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <ActionButton label="Move block up" disabled={isFirst} onClick={() => onMove('up')}><ArrowUp className="h-3.5 w-3.5" /></ActionButton>
          <ActionButton label="Move block down" disabled={isLast} onClick={() => onMove('down')}><ArrowDown className="h-3.5 w-3.5" /></ActionButton>
          <ActionButton label="Duplicate block" onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></ActionButton>
          <ActionButton label="Delete block" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></ActionButton>
        </div>
      </div>

      {block.type === 'paragraph' && (
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700">Text</span>
          <textarea value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} className={textareaClass} />
        </label>
      )}

      {block.type === 'heading' && (
        <div className="grid gap-3 md:grid-cols-[1fr_120px]">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Heading text</span>
            <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} className={inputClass} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Level</span>
            <select
              value={block.level}
              onChange={e => onChange({
                ...block,
                level: Number(e.target.value) as HeadingBlock['level']
              })}
              className={inputClass}
            >
              {[1, 2, 3, 4, 5, 6].map(level => <option key={level} value={level}>H{level}</option>)}
            </select>
          </label>
        </div>
      )}

      {(block.type === 'orderedList' || block.type === 'bulletList') && (
        <div className="space-y-2">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-2">
              <span className="w-6 text-center font-mono text-xs text-slate-400">
                {block.type === 'orderedList' ? itemIndex + 1 : '•'}
              </span>
              <input
                value={item}
                onChange={e => updateListItem(block, itemIndex, e.target.value)}
                className={inputClass}
                aria-label={(block.type === 'orderedList' ? 'Ordered' : 'Bullet') + ' list item ' + (itemIndex + 1)}
              />
              <button
                type="button"
                onClick={() => removeListItem(block, itemIndex)}
                className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                aria-label={'Delete list item ' + (itemIndex + 1)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addListItem(block)} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50">
            + Add item
          </button>
        </div>
      )}

      {block.type === 'table' && (
        <SopTableEditor block={block as TableBlock} onChange={next => onChange(next)} />
      )}

      {block.type === 'image' && (
        <div className="space-y-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Asset</span>
            <select
              value={block.assetId}
              onChange={e => onChange({ ...block, assetId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select an existing asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename} · {asset.mediaType}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-700">Caption</span>
              <input value={block.caption ?? ''} onChange={e => onChange({ ...block, caption: e.target.value })} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-700">Alt text</span>
              <input value={block.altText ?? ''} onChange={e => onChange({ ...block, altText: e.target.value })} className={inputClass} />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">File selection and binary storage are deferred; this editor associates an image block with a document asset only.</p>
        </div>
      )}

      {block.type === 'formula' && (
        <div className="space-y-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Expression</span>
            <textarea value={block.expression} onChange={e => onChange({ ...block, expression: e.target.value })} className={textareaClass} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-700">Display</span>
              <textarea value={block.display ?? ''} onChange={e => onChange({ ...block, display: e.target.value })} className={textareaClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-700">Explanation</span>
              <textarea value={block.explanation ?? ''} onChange={e => onChange({ ...block, explanation: e.target.value })} className={textareaClass} />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">Formula fields are document content only. No calculation or execution is performed.</p>
        </div>
      )}

      {block.type === 'callout' && (
        <div className="grid gap-3 md:grid-cols-[160px_1fr]">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Variant</span>
            <select value={block.variant} onChange={e => onChange({ ...block, variant: e.target.value as typeof block.variant })} className={inputClass}>
              <option value="note">Note</option>
              <option value="caution">Caution</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-700">Title</span>
            <input value={block.title ?? ''} onChange={e => onChange({ ...block, title: e.target.value })} className={inputClass} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-700">Text</span>
            <textarea value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} className={textareaClass} />
          </label>
        </div>
      )}

      {block.type === 'pageBreak' && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs font-semibold text-slate-500">
          Page break marker · rendering and pagination are deferred
        </div>
      )}
    </article>
  );
};

const ActionButton: React.FC<{
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, disabled, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-amber-300"
  >
    {children}
  </button>
);

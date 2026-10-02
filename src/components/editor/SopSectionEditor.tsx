import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { SOPBlock, SOPSection, SOPAsset } from '../../model/sopDocument';
import { SopBlockEditor } from './SopBlockEditor';

interface Props {
  section: SOPSection;
  sectionNumber: string;
  assets: SOPAsset[];
  activeBlockIndex: number | undefined;
  onSelectBlock: (index: number) => void;
  onRename: (title: string) => void;
  onAddBlock: (block: SOPBlock, index?: number) => void;
  onChangeBlock: (index: number, block: SOPBlock) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (index: number) => void;
  onDeleteBlock: (index: number) => void;
}

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const newBlock = (type: SOPBlock['type']): SOPBlock => {
  switch (type) {
    case 'paragraph': return { type, text: '' };
    case 'heading': return { type, text: '', level: 2 };
    case 'orderedList': return { type, items: [''] };
    case 'bulletList': return { type, items: [''] };
    case 'table': return { type, headers: ['', ''], rows: [['', '']] };
    case 'image': return { type, assetId: '' };
    case 'formula': return { type, expression: '' };
    case 'callout': return { type, variant: 'note', text: '' };
    case 'pageBreak': return { type };
  }
};

export const SopSectionEditor: React.FC<Props> = ({
  section,
  sectionNumber,
  assets,
  activeBlockIndex,
  onSelectBlock,
  onRename,
  onAddBlock,
  onChangeBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock
}) => {
  const blockTypes = useMemo(() => ([
    ['paragraph', 'Paragraph'],
    ['heading', 'Heading'],
    ['orderedList', 'Ordered list'],
    ['bulletList', 'Bullet list'],
    ['table', 'Table'],
    ['image', 'Image'],
    ['formula', 'Formula'],
    ['callout', 'Callout'],
    ['pageBreak', 'Page break']
  ] as const), []);

  return (
    <section className="space-y-4" aria-labelledby={'section-editor-heading-' + section.id}>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-500">{sectionNumber}</div>
        <h2 id={'section-editor-heading-' + section.id} className="sr-only">Editing section {sectionNumber}</h2>
        <label htmlFor={'section-title-' + section.id} className="sr-only">Section title</label>
        <input
          id={'section-title-' + section.id}
          value={section.title}
          placeholder="Section title"
          onChange={event => onRename(event.target.value)}
          className={inputClass}
        />
        <p className="mt-2 text-[11px] text-slate-500">Blocks below are the content of this section. Child sections are managed from the navigator.</p>
      </div>

      <div className="space-y-3">
        {section.blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
            No content yet. Add a block below.
          </div>
        ) : section.blocks.map((block, index) => (
          <div key={section.id + '-block-' + index}>
            <SopBlockEditor
              index={index}
              block={block}
              assets={assets}
              isFirst={index === 0}
              isLast={index === section.blocks.length - 1}
              onSelect={() => onSelectBlock(index)}
              onChange={next => onChangeBlock(index, next)}
              onMove={direction => onMoveBlock(index, direction)}
              onDuplicate={() => onDuplicateBlock(index)}
              onDelete={() => onDeleteBlock(index)}
            />
            {activeBlockIndex === index && <div className="mt-1 h-0.5 rounded bg-amber-400" aria-hidden="true" />}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div className="mb-2 text-xs font-semibold text-slate-700">Add block</div>
        <div className="flex flex-wrap gap-2">
          {blockTypes.map(([type, label]) => (
            <button
              type="button"
              key={type}
              onClick={() => onAddBlock(newBlock(type))}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <Plus className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

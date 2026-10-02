import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCog, SlidersHorizontal } from 'lucide-react';
import type { SOPBlock, SOPDocument, SOPSection } from '../../model/sopDocument';
import { validateSOPDocument } from '../../model/sopDocument';
import {
  addAssetReference,
  addBlock,
  addSection,
  duplicateBlock,
  indentSection,
  moveBlock,
  moveSection,
  outdentSection,
  removeBlock,
  removeSection,
  updateBlock,
  updateMetadata,
  updateRevisionHistory,
  updateSection,
  updateStyle
} from '../../model/sopDocumentEditor';
import { SopMetadataEditor } from './SopMetadataEditor';
import { SopRevisionHistoryEditor } from './SopRevisionHistoryEditor';
import { SopSectionEditor } from './SopSectionEditor';
import { SopSectionNavigator } from './SopSectionNavigator';

interface Props {
  document: SOPDocument;
  onChange: (document: SOPDocument) => void;
}

function findSection(sections: SOPSection[], id: string | undefined): SOPSection | undefined {
  if (!id) return undefined;
  for (const section of sections) {
    if (section.id === id) return section;
    const nested = findSection(section.sections, id);
    if (nested) return nested;
  }
  return undefined;
}

function sectionNumber(sections: SOPSection[], id: string, prefix: number[] = []): string | undefined {
  for (let index = 0; index < sections.length; index += 1) {
    const nextPrefix = [...prefix, index + 1];
    if (sections[index].id === id) return nextPrefix.join('.');
    const nested = sectionNumber(sections[index].sections, id, nextPrefix);
    if (nested) return nested;
  }
  return undefined;
}

function collectSectionIds(section: SOPSection): string[] {
  return [section.id, ...section.sections.flatMap(collectSectionIds)];
}

const applyOperation = (
  current: SOPDocument,
  operation: () => SOPDocument,
  onChange: (document: SOPDocument) => void,
  onError: (message: string) => void
): SOPDocument | undefined => {
  try {
    const next = operation();
    onChange(next);
    onError('');
    return next;
  } catch (error) {
    onError(error instanceof Error ? error.message : 'The requested operation could not be completed.');
    return undefined;
  }
};

export const SopEditorWorkspace: React.FC<Props> = ({ document, onChange }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>();
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>();
  const [errorMessage, setErrorMessage] = useState('');
  const [showStyle, setShowStyle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [assetForm, setAssetForm] = useState({
    id: '',
    filename: '',
    mediaType: 'image/png',
    reference: ''
  });

  const firstSectionId = document.sections[0]?.id;

  useEffect(() => {
    if (!activeSectionId || !findSection(document.sections, activeSectionId)) {
      setActiveSectionId(firstSectionId);
      setActiveBlockIndex(undefined);
    }
  }, [activeSectionId, document.sections, firstSectionId]);

  const activeSection = findSection(document.sections, activeSectionId);
  const activeNumber = activeSection
    ? sectionNumber(document.sections, activeSection.id)
    : undefined;

  const validation = useMemo(() => validateSOPDocument(document), [document]);

  const perform = (operation: () => SOPDocument): SOPDocument | undefined =>
    applyOperation(document, operation, onChange, setErrorMessage);

  const selectSection = (id: string) => {
    setActiveSectionId(id);
    setActiveBlockIndex(undefined);
    window.requestAnimationFrame(() => {
      globalThis.document.getElementById('section-title-' + id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  };

  const addRoot = () => {
    const next = perform(() => addSection(document));
    const added = next?.sections[next.sections.length - 1];
    if (added) {
      setActiveSectionId(added.id);
      setActiveBlockIndex(undefined);
    }
  };

  const addChild = (id: string) => {
    const before = findSection(document.sections, id);
    if (!before) return;
    const next = perform(() => addSection(document, id));
    const parent = next && findSection(next.sections, id);
    const added = parent?.sections[parent.sections.length - 1];
    if (added) {
      setActiveSectionId(added.id);
      setActiveBlockIndex(undefined);
    }
  };

  const renameSection = (id: string) => {
    const current = findSection(document.sections, id);
    const title = window.prompt('Section title', current?.title ?? '');
    if (title === null) return;
    perform(() => updateSection(document, id, { title }));
  };

  const deleteSection = (id: string) => {
    const target = findSection(document.sections, id);
    if (!target) return;

    const hasContent = target.blocks.length > 0 || target.sections.length > 0;
    if (hasContent && !window.confirm(
      'Delete "' + (target.title || 'Untitled section') + '" and all child content?'
    )) {
      return;
    }

    const removedIds = collectSectionIds(target);
    const next = perform(() => removeSection(document, id));
    if (next && removedIds.includes(activeSectionId ?? '')) {
      const fallback = next.sections[0];
      setActiveSectionId(fallback?.id);
      setActiveBlockIndex(undefined);
    }
  };

  const addBlockAt = (block: SOPBlock, index?: number) => {
    if (!activeSection) return;
    const insertionIndex = index ?? activeSection.blocks.length;
    const next = perform(() => addBlock(document, activeSection.id, block, index));
    if (next) setActiveBlockIndex(insertionIndex);
  };

  const handleChangeBlock = (index: number, block: SOPBlock) => {
    if (!activeSection) return;
    const next = perform(() => updateBlock(document, activeSection.id, index, block));
    if (next) setActiveBlockIndex(index);
  };

  const deleteBlock = (index: number) => {
    if (!activeSection) return;
    if (!window.confirm('Delete this block?')) return;
    const next = perform(() => removeBlock(document, activeSection.id, index));
    if (next) {
      setActiveBlockIndex(undefined);
    }
  };

  const moveBlockSafe = (index: number, direction: 'up' | 'down') => {
    if (!activeSection) return;
    const next = perform(() => moveBlock(document, activeSection.id, index, direction));
    if (next) setActiveBlockIndex(direction === 'up' ? index - 1 : index + 1);
  };

  const duplicateBlockSafe = (index: number) => {
    if (!activeSection) return;
    const next = perform(() => duplicateBlock(document, activeSection.id, index));
    if (next) setActiveBlockIndex(index + 1);
  };

  const addAsset = () => {
    const asset = {
      id: assetForm.id.trim(),
      filename: assetForm.filename.trim(),
      mediaType: assetForm.mediaType.trim(),
      reference: assetForm.reference.trim()
    };

    if (!asset.id || !asset.filename || !asset.mediaType || !asset.reference) {
      setErrorMessage('Asset ID, filename, media type, and reference are required.');
      return;
    }

    const next = perform(() => addAssetReference(document, asset));
    if (next) {
      setAssetForm({
        id: '',
        filename: '',
        mediaType: 'image/png',
        reference: ''
      });
    }
  };

  const stylePatch = (patch: Partial<SOPDocument['style']>) => {
    const next = perform(() => updateStyle(document, patch));
    if (!next) return;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileCog className="h-4 w-4 text-amber-600" />
            SOP Editor
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Single-user in-memory authoring workspace · schema {document.schemaVersion}
          </p>
        </div>
        <StatusBadge valid={validation.valid} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-20 xl:self-start">
          <SopSectionNavigator
            document={document}
            activeSectionId={activeSectionId}
            onSelectSection={selectSection}
            onAddRootSection={addRoot}
            onAddChildSection={addChild}
            onRenameSection={renameSection}
            onMoveSection={(id, direction) => perform(() => moveSection(document, id, direction))}
            onIndentSection={id => perform(() => indentSection(document, id))}
            onOutdentSection={id => perform(() => outdentSection(document, id))}
            onDeleteSection={deleteSection}
          />
        </div>

        <main className="min-w-0 space-y-4" aria-label="SOP document editor">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          <SopMetadataEditor
            metadata={document.metadata}
            onChange={patch => perform(() => updateMetadata(document, patch))}
          />

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              onClick={() => setShowStyle(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> {showStyle ? 'Hide' : 'Show'} style settings
            </button>
            <button
              type="button"
              onClick={() => setShowAssets(prev => !prev)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Assets ({document.assets.length})
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(prev => !prev)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Revision history ({document.revisionHistory.length})
            </button>
          </div>

          {showStyle && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Document style</h2>
              <div className="grid gap-3 md:grid-cols-4">
                <label className="text-xs font-medium text-slate-700">
                  Page size
                  <input
                    value={document.style.pageSize}
                    onChange={e => stylePatch({ pageSize: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Orientation
                  <select
                    value={document.style.orientation}
                    onChange={e => stylePatch({
                      orientation: e.target.value as SOPDocument['style']['orientation']
                    })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Base font
                  <input
                    value={document.style.baseFont}
                    onChange={e => stylePatch({ baseFont: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Base size
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={document.style.baseFontSize}
                    onChange={e => stylePatch({ baseFontSize: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                  <label key={side} className="text-xs font-medium text-slate-700">
                    Margin {side}
                    <input
                      value={document.style.margins[side]}
                      onChange={e => stylePatch({
                        margins: { ...document.style.margins, [side]: e.target.value }
                      })}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {showAssets && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Document assets</h2>
              <p className="mt-1 text-xs text-slate-500">
                Reference-only asset entries; actual file handling is deferred to WP-04.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {(['id', 'filename', 'mediaType', 'reference'] as const).map(field => (
                  <label key={field} className="text-xs font-medium text-slate-700">
                    {field}
                    <input
                      value={assetForm[field]}
                      onChange={e => setAssetForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={addAsset}
                className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Add asset reference
              </button>
              <div className="mt-3 space-y-2">
                {document.assets.map(asset => (
                  <div key={asset.id} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <span className="font-semibold">{asset.filename}</span>
                    <span className="ml-2 text-slate-500">
                      {asset.mediaType} · {asset.reference ?? 'embedded data'}
                    </span>
                  </div>
                ))}
                {document.assets.length === 0 && (
                  <p className="text-xs text-slate-500">No assets defined.</p>
                )}
              </div>
            </section>
          )}

          {activeSection ? (
            <SopSectionEditor
              section={activeSection}
              sectionNumber={activeNumber ?? ''}
              assets={document.assets}
              activeBlockIndex={activeBlockIndex}
              onSelectBlock={setActiveBlockIndex}
              onRename={title => perform(() => updateSection(document, activeSection.id, { title }))}
              onAddBlock={addBlockAt}
              onChangeBlock={handleChangeBlock}
              onMoveBlock={moveBlockSafe}
              onDuplicateBlock={duplicateBlockSafe}
              onDeleteBlock={deleteBlock}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Start your SOP</h2>
              <p className="mt-1 text-sm text-slate-500">Add a section from the navigator to begin editing.</p>
              <button
                type="button"
                onClick={addRoot}
                className="mt-4 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
              >
                Add section
              </button>
            </div>
          )}

          {showHistory && (
            <SopRevisionHistoryEditor
              entries={document.revisionHistory}
              onChange={entries => perform(() => updateRevisionHistory(document, entries))}
            />
          )}

          {!validation.valid && (
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">Document validation errors</div>
                <div className="mt-1">{validation.errors.join(' ')}</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ' + (
        valid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      )}
      role="status"
    >
      {valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      {valid ? 'Valid document' : 'Validation errors'}
    </span>
  );
}

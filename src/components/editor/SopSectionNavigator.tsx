import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderPlus, ArrowUp, ArrowDown, IndentIncrease, IndentDecrease, Pencil, Trash2 } from 'lucide-react';
import type { SOPDocument, SOPSection } from '../../model/sopDocument';

interface Props {
  document: SOPDocument;
  activeSectionId: string | undefined;
  onSelectSection: (sectionId: string) => void;
  onAddRootSection: () => void;
  onAddChildSection: (sectionId: string) => void;
  onRenameSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onIndentSection: (sectionId: string) => void;
  onOutdentSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

function flattenVisibleSections(
  sections: SOPSection[],
  collapsed: Set<string>,
  result: string[] = []
): string[] {
  for (const section of sections) {
    result.push(section.id);
    if (!collapsed.has(section.id)) {
      flattenVisibleSections(section.sections, collapsed, result);
    }
  }
  return result;
}

const buttonClass = 'rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300';

export const SopSectionNavigator: React.FC<Props> = ({
  document,
  activeSectionId,
  onSelectSection,
  onAddRootSection,
  onAddChildSection,
  onRenameSection,
  onMoveSection,
  onIndentSection,
  onOutdentSection,
  onDeleteSection
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visibleCount = useMemo(
    () => flattenVisibleSections(document.sections, collapsed).length,
    [document.sections, collapsed]
  );
  const totalCount = countSections(document.sections);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Section navigator">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Sections</h2>
          <p className="text-[11px] text-slate-500">{visibleCount} visible · {totalCount} total</p>
        </div>
        <button
          type="button"
          onClick={onAddRootSection}
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <FolderPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {document.sections.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
          No sections yet.
          <button
            type="button"
            onClick={onAddRootSection}
            className="mt-2 block w-full rounded-md bg-amber-400 px-3 py-2 font-semibold text-slate-900 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Add first section
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {document.sections.map((section, index) => (
            <SectionTreeItem
              key={section.id}
              section={section}
              number={String(index + 1)}
              depth={0}
              activeSectionId={activeSectionId}
              collapsed={collapsed}
              onToggle={id => setCollapsed(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
              })}
              onSelectSection={onSelectSection}
              onAddChildSection={onAddChildSection}
              onRenameSection={onRenameSection}
              onMoveSection={onMoveSection}
              onIndentSection={onIndentSection}
              onOutdentSection={onOutdentSection}
              onDeleteSection={onDeleteSection}
            />
          ))}
        </div>
      )}
    </aside>
  );
};

interface TreeProps {
  section: SOPSection;
  number: string;
  depth: number;
  activeSectionId: string | undefined;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onSelectSection: (id: string) => void;
  onAddChildSection: (id: string) => void;
  onRenameSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onIndentSection: (id: string) => void;
  onOutdentSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
}

const SectionTreeItem: React.FC<TreeProps> = ({
  section,
  number,
  depth,
  activeSectionId,
  collapsed,
  onToggle,
  onSelectSection,
  onAddChildSection,
  onRenameSection,
  onMoveSection,
  onIndentSection,
  onOutdentSection,
  onDeleteSection
}) => {
  const isCollapsed = collapsed.has(section.id);
  const isActive = activeSectionId === section.id;
  const hasChildren = section.sections.length > 0;

  return (
    <div>
      <div
        className={'rounded-md border px-2 py-2 transition ' + (
          isActive
            ? 'border-amber-400 bg-amber-50'
            : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
        )}
        style={{ marginLeft: depth * 12 }}
      >
        <div className="flex items-start gap-1.5">
          <button
            type="button"
            onClick={() => hasChildren && onToggle(section.id)}
            className={buttonClass}
            aria-label={hasChildren ? (isCollapsed ? 'Expand section' : 'Collapse section') : 'Section has no children'}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            ) : <span className="block h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectSection(section.id)}
            className="min-w-0 flex-1 rounded text-left focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
          >
            <span className="font-mono text-[10px] font-semibold text-slate-500">{number}</span>
            <span className="ml-2 text-xs font-semibold text-slate-800">
              {section.title || 'Untitled section'}
            </span>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 pl-7">
          <IconButton label="Add child section" onClick={() => onAddChildSection(section.id)}><FolderPlus className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Rename section" onClick={() => onRenameSection(section.id)}><Pencil className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Move section up" onClick={() => onMoveSection(section.id, 'up')}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Move section down" onClick={() => onMoveSection(section.id, 'down')}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Indent section" onClick={() => onIndentSection(section.id)}><IndentIncrease className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Outdent section" onClick={() => onOutdentSection(section.id)}><IndentDecrease className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Delete section" onClick={() => onDeleteSection(section.id)}><Trash2 className="h-3.5 w-3.5" /></IconButton>
        </div>
      </div>

      {!isCollapsed && section.sections.map((child, index) => (
        <SectionTreeItem
          key={child.id}
          section={child}
          number={number + '.' + (index + 1)}
          depth={depth + 1}
          activeSectionId={activeSectionId}
          collapsed={collapsed}
          onToggle={onToggle}
          onSelectSection={onSelectSection}
          onAddChildSection={onAddChildSection}
          onRenameSection={onRenameSection}
          onMoveSection={onMoveSection}
          onIndentSection={onIndentSection}
          onOutdentSection={onOutdentSection}
          onDeleteSection={onDeleteSection}
        />
      ))}
    </div>
  );
};

const IconButton: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={buttonClass}
  >
    {children}
  </button>
);

function countSections(sections: SOPSection[]): number {
  return sections.reduce((count, section) => count + 1 + countSections(section.sections), 0);
}

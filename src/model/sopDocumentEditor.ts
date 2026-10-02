import {
  validateSOPDocument,
  type SOPBlock,
  type SOPDocument,
  type SOPDocumentMetadata,
  type SOPRevisionEntry,
  type SOPSection,
  type SOPStyleSettings,
  type SOPAsset
} from './sopDocument';

export interface SOPDocumentEditor {
  updateMetadata(document: SOPDocument, patch: Partial<SOPDocumentMetadata>): SOPDocument;
  addSection(document: SOPDocument, parentSectionId?: string): SOPDocument;
  updateSection(document: SOPDocument, sectionId: string, patch: Partial<Pick<SOPSection, 'title'>>): SOPDocument;
  removeSection(document: SOPDocument, sectionId: string): SOPDocument;
  moveSection(document: SOPDocument, sectionId: string, direction: 'up' | 'down'): SOPDocument;
  indentSection(document: SOPDocument, sectionId: string): SOPDocument;
  outdentSection(document: SOPDocument, sectionId: string): SOPDocument;
  addBlock(document: SOPDocument, sectionId: string, block: SOPBlock, index?: number): SOPDocument;
  updateBlock(document: SOPDocument, sectionId: string, blockIndex: number, block: SOPBlock): SOPDocument;
  removeBlock(document: SOPDocument, sectionId: string, blockIndex: number): SOPDocument;
  moveBlock(document: SOPDocument, sectionId: string, blockIndex: number, direction: 'up' | 'down'): SOPDocument;
  duplicateBlock(document: SOPDocument, sectionId: string, blockIndex: number): SOPDocument;
  updateRevisionHistory(document: SOPDocument, entries: SOPRevisionEntry[]): SOPDocument;
  addAssetReference(document: SOPDocument, asset: SOPAsset): SOPDocument;
  updateStyle(document: SOPDocument, patch: Partial<SOPStyleSettings>): SOPDocument;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ??
    'sop-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

function commit(document: SOPDocument): SOPDocument {
  const validation = validateSOPDocument(document);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }
  return document;
}

function findSection(sections: SOPSection[], id: string): SOPSection | undefined {
  for (const section of sections) {
    if (section.id === id) return section;
    const nested = findSection(section.sections, id);
    if (nested) return nested;
  }
  return undefined;
}

function normalizeLevels(sections: SOPSection[], level = 1): void {
  sections.forEach(section => {
    section.level = level;
    normalizeLevels(section.sections, level + 1);
  });
}

export function updateMetadata(
  document: SOPDocument,
  patch: Partial<SOPDocumentMetadata>
): SOPDocument {
  const next = clone(document);
  next.metadata = { ...next.metadata, ...patch };
  return commit(next);
}

export function addSection(document: SOPDocument, parentSectionId?: string): SOPDocument {
  const next = clone(document);
  const section: SOPSection = {
    id: createId(),
    title: '',
    level: 1,
    blocks: [],
    sections: []
  };

  if (!parentSectionId) {
    next.sections.push(section);
  } else {
    const parent = findSection(next.sections, parentSectionId);
    if (!parent) throw new Error('Cannot add section: parent section was not found.');
    parent.sections.push(section);
  }

  normalizeLevels(next.sections);
  return commit(next);
}

export function updateSection(
  document: SOPDocument,
  sectionId: string,
  patch: Partial<Pick<SOPSection, 'title'>>
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot update section: section was not found.');
  Object.assign(section, patch);
  return commit(next);
}

function removeFromTree(sections: SOPSection[], id: string): boolean {
  const index = sections.findIndex(section => section.id === id);
  if (index >= 0) {
    sections.splice(index, 1);
    return true;
  }
  return sections.some(section => removeFromTree(section.sections, id));
}

export function removeSection(document: SOPDocument, sectionId: string): SOPDocument {
  const next = clone(document);
  if (!removeFromTree(next.sections, sectionId)) {
    throw new Error('Cannot remove section: section was not found.');
  }
  normalizeLevels(next.sections);
  return commit(next);
}

function moveInSiblings(sections: SOPSection[], id: string, direction: 'up' | 'down'): boolean {
  const index = sections.findIndex(section => section.id === id);
  if (index >= 0) {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) {
      throw new Error(
        'Cannot move section ' + direction + ': there is no sibling in that direction.'
      );
    }
    [sections[index], sections[target]] = [sections[target], sections[index]];
    return true;
  }

  for (const section of sections) {
    if (moveInSiblings(section.sections, id, direction)) return true;
  }
  return false;
}

export function moveSection(
  document: SOPDocument,
  sectionId: string,
  direction: 'up' | 'down'
): SOPDocument {
  const next = clone(document);
  if (!moveInSiblings(next.sections, sectionId, direction)) {
    throw new Error('Cannot move section: section was not found.');
  }
  normalizeLevels(next.sections);
  return commit(next);
}

function indentInTree(sections: SOPSection[], id: string): boolean {
  const index = sections.findIndex(section => section.id === id);
  if (index >= 0) {
    if (index === 0) {
      throw new Error('Cannot indent section: no preceding sibling exists.');
    }
    const section = sections.splice(index, 1)[0];
    sections[index - 1].sections.push(section);
    return true;
  }

  for (const section of sections) {
    if (indentInTree(section.sections, id)) return true;
  }
  return false;
}

export function indentSection(document: SOPDocument, sectionId: string): SOPDocument {
  const next = clone(document);
  if (!indentInTree(next.sections, sectionId)) {
    throw new Error('Cannot indent section: section was not found.');
  }
  normalizeLevels(next.sections);
  return commit(next);
}

function outdentInTree(
  siblings: SOPSection[],
  parentSection: SOPSection | undefined,
  grandparentSiblings: SOPSection[] | undefined,
  id: string
): boolean {
  const directIndex = siblings.findIndex(section => section.id === id);
  if (directIndex >= 0) {
    if (!parentSection || !grandparentSiblings) {
      throw new Error('Cannot outdent section: section is already at the root level.');
    }
    const section = siblings.splice(directIndex, 1)[0];
    const parentIndex = grandparentSiblings.findIndex(item => item.id === parentSection.id);
    if (parentIndex < 0) {
      throw new Error('Cannot outdent section: parent relationship is invalid.');
    }
    grandparentSiblings.splice(parentIndex + 1, 0, section);
    return true;
  }

  for (const section of siblings) {
    if (outdentInTree(section.sections, section, siblings, id)) return true;
  }
  return false;
}

export function outdentSection(document: SOPDocument, sectionId: string): SOPDocument {
  const next = clone(document);
  if (!outdentInTree(next.sections, undefined, undefined, sectionId)) {
    throw new Error('Cannot outdent section: section was not found.');
  }
  normalizeLevels(next.sections);
  return commit(next);
}

export function addBlock(
  document: SOPDocument,
  sectionId: string,
  block: SOPBlock,
  index?: number
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot add block: section was not found.');

  const insertionIndex = index === undefined
    ? section.blocks.length
    : Math.max(0, Math.min(index, section.blocks.length));

  section.blocks.splice(insertionIndex, 0, clone(block));
  return commit(next);
}

export function updateBlock(
  document: SOPDocument,
  sectionId: string,
  blockIndex: number,
  block: SOPBlock
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot update block: section was not found.');
  if (!Number.isInteger(blockIndex) || blockIndex < 0 || blockIndex >= section.blocks.length) {
    throw new Error('Cannot update block: block index is invalid.');
  }
  section.blocks[blockIndex] = clone(block);
  return commit(next);
}

export function removeBlock(
  document: SOPDocument,
  sectionId: string,
  blockIndex: number
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot remove block: section was not found.');
  if (!Number.isInteger(blockIndex) || blockIndex < 0 || blockIndex >= section.blocks.length) {
    throw new Error('Cannot remove block: block index is invalid.');
  }
  section.blocks.splice(blockIndex, 1);
  return commit(next);
}

export function moveBlock(
  document: SOPDocument,
  sectionId: string,
  blockIndex: number,
  direction: 'up' | 'down'
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot move block: section was not found.');
  if (!Number.isInteger(blockIndex) || blockIndex < 0 || blockIndex >= section.blocks.length) {
    throw new Error('Cannot move block: block index is invalid.');
  }

  const target = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
  if (target < 0 || target >= section.blocks.length) {
    throw new Error(
      'Cannot move block ' + direction + ': there is no block in that direction.'
    );
  }

  [section.blocks[blockIndex], section.blocks[target]] = [
    section.blocks[target],
    section.blocks[blockIndex]
  ];
  return commit(next);
}

export function duplicateBlock(
  document: SOPDocument,
  sectionId: string,
  blockIndex: number
): SOPDocument {
  const next = clone(document);
  const section = findSection(next.sections, sectionId);
  if (!section) throw new Error('Cannot duplicate block: section was not found.');
  if (!Number.isInteger(blockIndex) || blockIndex < 0 || blockIndex >= section.blocks.length) {
    throw new Error('Cannot duplicate block: block index is invalid.');
  }

  section.blocks.splice(blockIndex + 1, 0, clone(section.blocks[blockIndex]));
  return commit(next);
}

export function updateRevisionHistory(
  document: SOPDocument,
  entries: SOPRevisionEntry[]
): SOPDocument {
  const next = clone(document);
  next.revisionHistory = clone(entries);
  return commit(next);
}

export function addAssetReference(document: SOPDocument, asset: SOPAsset): SOPDocument {
  const next = clone(document);
  if (next.assets.some(existing => existing.id === asset.id)) {
    throw new Error('Cannot add asset: asset ID "' + asset.id + '" already exists.');
  }
  next.assets.push(clone(asset));
  return commit(next);
}

export function updateStyle(
  document: SOPDocument,
  patch: Partial<SOPStyleSettings>
): SOPDocument {
  const next = clone(document);
  next.style = { ...next.style, ...patch };
  return commit(next);
}

export const sopDocumentEditor: SOPDocumentEditor = {
  updateMetadata,
  addSection,
  updateSection,
  removeSection,
  moveSection,
  indentSection,
  outdentSection,
  addBlock,
  updateBlock,
  removeBlock,
  moveBlock,
  duplicateBlock,
  updateRevisionHistory,
  addAssetReference,
  updateStyle
};

/**
 * Generic SOP document model for WP-02.
 *
 * This module contains document structure only. It does not implement
 * editing UI, file I/O, pagination, rendering, AI, or workflow behavior.
 */

export const SOP_SCHEMA_VERSION = '1.0' as const;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type CalloutVariant = 'note' | 'caution' | 'warning' | 'info';

export interface SOPDocumentMetadata {
  title: string;
  documentNumber: string;
  revision: string;
  effectiveDate: string;
  reviewDate: string;
  organization: string;
  department: string;
}

export interface SOPRevisionEntry {
  revision: string;
  date: string;
  description: string;
  preparedBy: string;
  approvedBy: string;
}

export interface SOPAsset {
  id: string;
  mediaType: string;
  filename: string;
  data?: string;
  reference?: string;
  caption?: string;
  altText?: string;
}

export interface SOPStyleSettings {
  pageSize: string;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  baseFont: string;
  baseFontSize: number;
  headingStyles: Partial<Record<HeadingLevel, {
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
  }>>;
  spacing: {
    paragraph: string;
    section: string;
  };
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface HeadingBlock {
  type: 'heading';
  text: string;
  level: HeadingLevel;
}

export interface ListBlock {
  type: 'orderedList' | 'bulletList';
  items: string[];
}

export interface TableBlock {
  type: 'table';
  headers?: string[];
  rows: string[][];
}

export interface ImageBlock {
  type: 'image';
  assetId: string;
  caption?: string;
  altText?: string;
}

export interface FormulaBlock {
  type: 'formula';
  expression: string;
  display?: string;
  explanation?: string;
}

export interface CalloutBlock {
  type: 'callout';
  variant: CalloutVariant;
  title?: string;
  text: string;
}

export interface PageBreakBlock {
  type: 'pageBreak';
}

export type SOPBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | TableBlock
  | ImageBlock
  | FormulaBlock
  | CalloutBlock
  | PageBreakBlock;

export interface SOPSection {
  id: string;
  title: string;
  level: number;
  blocks: SOPBlock[];
  sections: SOPSection[];
}

export interface SOPDocument {
  schemaVersion: typeof SOP_SCHEMA_VERSION;
  id: string;
  metadata: SOPDocumentMetadata;
  sections: SOPSection[];
  revisionHistory: SOPRevisionEntry[];
  assets: SOPAsset[];
  style: SOPStyleSettings;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const DEFAULT_SOP_STYLE: SOPStyleSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  baseFont: 'Arial',
  baseFontSize: 11,
  headingStyles: {},
  spacing: {
    paragraph: '1em',
    section: '1.5em'
  }
};

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `sop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptySOPDocument(): SOPDocument {
  return {
    schemaVersion: SOP_SCHEMA_VERSION,
    id: createId(),
    metadata: {
      title: '',
      documentNumber: '',
      revision: '',
      effectiveDate: '',
      reviewDate: '',
      organization: '',
      department: ''
    },
    sections: [],
    revisionHistory: [],
    assets: [],
    style: structuredClone(DEFAULT_SOP_STYLE)
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function validateBlock(block: unknown, path: string, errors: string[]): void {
  if (!isRecord(block)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  const type = block.type;
  if (!isNonEmptyString(type)) {
    errors.push(`${path}.type must be a non-empty string.`);
    return;
  }

  switch (type) {
    case 'paragraph':
      if (typeof block.text !== 'string') errors.push(`${path}.text must be a string.`);
      break;

    case 'heading':
      if (typeof block.text !== 'string') errors.push(`${path}.text must be a string.`);
      if (![1, 2, 3, 4, 5, 6].includes(block.level as number)) {
        errors.push(`${path}.level must be an integer from 1 to 6.`);
      }
      break;

    case 'orderedList':
    case 'bulletList':
      if (!Array.isArray(block.items) || block.items.some(item => typeof item !== 'string')) {
        errors.push(`${path}.items must be an array of strings.`);
      }
      break;

    case 'table': {
      if (block.headers !== undefined &&
        (!Array.isArray(block.headers) || block.headers.some(cell => typeof cell !== 'string'))) {
        errors.push(`${path}.headers must be an array of strings when supplied.`);
      }
      if (!Array.isArray(block.rows) || block.rows.some(row =>
        !Array.isArray(row) || row.some(cell => typeof cell !== 'string')
      )) {
        errors.push(`${path}.rows must be an array of string arrays.`);
        break;
      }
      if (Array.isArray(block.headers) && block.rows.some(row => row.length !== block.headers!.length)) {
        errors.push(`${path}.rows must match the number of header columns.`);
      }
      if (!Array.isArray(block.headers) && block.rows.length > 0) {
        const width = block.rows[0].length;
        if (block.rows.some(row => row.length !== width)) {
          errors.push(`${path}.rows must have a consistent column count.`);
        }
      }
      break;
    }

    case 'image':
      if (!isNonEmptyString(block.assetId)) errors.push(`${path}.assetId must be a non-empty string.`);
      if (block.caption !== undefined && typeof block.caption !== 'string') {
        errors.push(`${path}.caption must be a string when supplied.`);
      }
      if (block.altText !== undefined && typeof block.altText !== 'string') {
        errors.push(`${path}.altText must be a string when supplied.`);
      }
      break;

    case 'formula':
      if (typeof block.expression !== 'string') errors.push(`${path}.expression must be a string.`);
      for (const key of ['display', 'explanation'] as const) {
        if (block[key] !== undefined && typeof block[key] !== 'string') {
          errors.push(`${path}.${key} must be a string when supplied.`);
        }
      }
      break;

    case 'callout':
      if (!['note', 'caution', 'warning', 'info'].includes(block.variant as string)) {
        errors.push(`${path}.variant must be note, caution, warning, or info.`);
      }
      if (typeof block.text !== 'string') errors.push(`${path}.text must be a string.`);
      if (block.title !== undefined && typeof block.title !== 'string') {
        errors.push(`${path}.title must be a string when supplied.`);
      }
      break;

    case 'pageBreak':
      break;

    default:
      errors.push(`${path}.type "${String(type)}" is not an approved block type.`);
  }
}

function validateSection(section: unknown, path: string, errors: string[]): void {
  if (!isRecord(section)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isNonEmptyString(section.id)) errors.push(`${path}.id must be a non-empty string.`);
  if (typeof section.title !== 'string') errors.push(`${path}.title must be a string.`);
  if (!Number.isInteger(section.level) || (section.level as number) < 1) {
    errors.push(`${path}.level must be a positive integer.`);
  }

  if (!Array.isArray(section.blocks)) {
    errors.push(`${path}.blocks must be an array.`);
  } else {
    section.blocks.forEach((block, index) => validateBlock(block, `${path}.blocks[${index}]`, errors));
  }

  if (!Array.isArray(section.sections)) {
    errors.push(`${path}.sections must be an array.`);
  } else {
    section.sections.forEach((child, index) => validateSection(child, `${path}.sections[${index}]`, errors));
  }
}


function collectImageAssetIds(section: unknown, result: string[]): void {
  if (!isRecord(section)) return;
  if (Array.isArray(section.blocks)) {
    for (const block of section.blocks) {
      if (isRecord(block) && block.type === 'image' && typeof block.assetId === 'string') {
        result.push(block.assetId);
      }
    }
  }
  if (Array.isArray(section.sections)) {
    for (const child of section.sections) collectImageAssetIds(child, result);
  }
}

function validateAsset(asset: unknown, path: string, errors: string[]): void {
  if (!isRecord(asset)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isNonEmptyString(asset.id)) errors.push(`${path}.id must be a non-empty string.`);
  if (!isNonEmptyString(asset.mediaType)) errors.push(`${path}.mediaType must be a non-empty string.`);
  if (!isNonEmptyString(asset.filename)) errors.push(`${path}.filename must be a non-empty string.`);

  const hasData = typeof asset.data === 'string' && asset.data.length > 0;
  const hasReference = typeof asset.reference === 'string' && asset.reference.length > 0;
  if (!hasData && !hasReference) {
    errors.push(`${path} must contain either data or reference.`);
  }
}

export function validateSOPDocument(value: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ['Document must be an object.'] };
  }

  if (value.schemaVersion !== SOP_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be "${SOP_SCHEMA_VERSION}".`);
  }
  if (!isNonEmptyString(value.id)) errors.push('id must be a non-empty string.');

  if (!isRecord(value.metadata)) {
    errors.push('metadata must be an object.');
  } else {
    for (const field of [
      'title',
      'documentNumber',
      'revision',
      'effectiveDate',
      'reviewDate',
      'organization',
      'department'
    ]) {
      if (typeof value.metadata[field] !== 'string') {
        errors.push(`metadata.${field} must be a string.`);
      }
    }
  }

  if (!Array.isArray(value.sections)) {
    errors.push('sections must be an array.');
  } else {
    value.sections.forEach((section, index) => validateSection(section, `sections[${index}]`, errors));
  }

  if (!Array.isArray(value.revisionHistory)) {
    errors.push('revisionHistory must be an array.');
  } else {
    value.revisionHistory.forEach((entry, index) => {
      const path = `revisionHistory[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${path} must be an object.`);
        return;
      }
      for (const field of ['revision', 'date', 'description', 'preparedBy', 'approvedBy']) {
        if (typeof entry[field] !== 'string') errors.push(`${path}.${field} must be a string.`);
      }
    });
  }

  if (!Array.isArray(value.assets)) {
    errors.push('assets must be an array.');
  } else {
    value.assets.forEach((asset, index) => validateAsset(asset, `assets[${index}]`, errors));

    const assetIds = new Set(
      value.assets
        .filter(isRecord)
        .map(asset => asset.id)
        .filter(isNonEmptyString)
    );
    const referencedAssetIds: string[] = [];
    if (Array.isArray(value.sections)) {
      value.sections.forEach(section => collectImageAssetIds(section, referencedAssetIds));
    }
    for (const assetId of referencedAssetIds) {
      if (!assetIds.has(assetId)) {
        errors.push(`image block references unknown asset "${assetId}".`);
      }
    }
  }

  if (!isRecord(value.style)) {
    errors.push('style must be an object.');
  } else {
    if (typeof value.style.pageSize !== 'string') errors.push('style.pageSize must be a string.');
    if (!['portrait', 'landscape'].includes(value.style.orientation as string)) {
      errors.push('style.orientation must be portrait or landscape.');
    }
    if (!isRecord(value.style.margins)) errors.push('style.margins must be an object.');
    if (typeof value.style.baseFont !== 'string') errors.push('style.baseFont must be a string.');
    if (typeof value.style.baseFontSize !== 'number' || value.style.baseFontSize <= 0) {
      errors.push('style.baseFontSize must be a positive number.');
    }
    if (!isRecord(value.style.headingStyles)) errors.push('style.headingStyles must be an object.');
    if (!isRecord(value.style.spacing)) errors.push('style.spacing must be an object.');
  }

  return { valid: errors.length === 0, errors };
}

export function serializeSOPDocument(document: SOPDocument): string {
  const validation = validateSOPDocument(document);
  if (!validation.valid) {
    throw new Error(`Cannot serialize invalid SOP document: ${validation.errors.join(' ')}`);
  }
  return JSON.stringify(document, null, 2);
}

export function deserializeSOPDocument(json: string): SOPDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON.';
    throw new Error(`Cannot deserialize SOP document: ${message}`);
  }

  const validation = validateSOPDocument(parsed);
  if (!validation.valid) {
    throw new Error(`Cannot deserialize invalid SOP document: ${validation.errors.join(' ')}`);
  }

  return parsed as SOPDocument;
}

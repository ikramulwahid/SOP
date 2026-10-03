import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  PageOrientation,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { buildSOPFilename } from './sopDocumentFile';
import {
  validateSOPDocument,
  type HeadingLevel as SOPHeadingLevel,
  type SOPAsset,
  type SOPBlock,
  type SOPDocument,
  type SOPSection
} from './sopDocument';

export interface SOPDocxImageNode {
  kind: 'image';
  assetId: string;
  data: Uint8Array;
  mediaType: string;
  width: number;
  height: number;
  altText: string;
  caption?: string;
}

export type SOPDocxPlanNode =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string; level: SOPHeadingLevel; fontSize?: number; bold?: boolean; italic?: boolean }
  | { kind: 'orderedList'; items: string[] }
  | { kind: 'bulletList'; items: string[] }
  | { kind: 'table'; headers?: string[]; rows: string[][] }
  | SOPDocxImageNode
  | { kind: 'formula'; expression: string; display?: string; explanation?: string }
  | { kind: 'callout'; variant: 'note' | 'caution' | 'warning' | 'info'; title?: string; text: string }
  | { kind: 'pageBreak' };

export interface SOPDocxPlan {
  title: string;
  metadata: Array<[string, string]>;
  nodes: SOPDocxPlanNode[];
  style: SOPDocument['style'];
  filename: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const PAGE_SIZE_TWIPS: Record<string, { width: number; height: number }> = {
  A3: { width: 16838, height: 23811 },
  A4: { width: 11906, height: 16838 },
  A5: { width: 8391, height: 11906 },
  LETTER: { width: 12240, height: 15840 },
  LEGAL: { width: 12240, height: 20160 }
};

type DocxImageType = 'png' | 'jpg' | 'gif' | 'bmp';

const IMAGE_MEDIA_TYPES = new Map<string, DocxImageType>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/gif', 'gif'],
  ['image/bmp', 'bmp']
]);

function parseLengthToTwips(value: string, fallbackTwips: number, baseFontSize = 11): number {
  const raw = value.trim().toLowerCase();
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) return fallbackTwips;

  if (raw.endsWith('mm')) return Math.round(number * 56.6929134);
  if (raw.endsWith('cm')) return Math.round(number * 566.929134);
  if (raw.endsWith('in')) return Math.round(number * 1440);
  if (raw.endsWith('pt')) return Math.round(number * 20);
  if (raw.endsWith('px')) return Math.round(number * 15);
  if (raw.endsWith('em')) return Math.round(number * baseFontSize * 20);

  return fallbackTwips;
}

function parsePageSize(pageSize: string): { width: number; height: number } {
  return PAGE_SIZE_TWIPS[pageSize.trim().toUpperCase()] ?? PAGE_SIZE_TWIPS.A4;
}

function parseDataUrl(data: string): { mediaType: string; bytes: Uint8Array } {
  const comma = data.indexOf(',');
  if (!data.startsWith('data:') || comma < 0) {
    throw new Error('Embedded image data must be a valid data URL.');
  }

  const header = data.slice(5, comma);
  const payload = data.slice(comma + 1);
  const mediaType = header.split(';')[0] || 'application/octet-stream';

  if (!header.includes(';base64')) {
    return { mediaType, bytes: new TextEncoder().encode(decodeURIComponent(payload)) };
  }

  const binary = globalThis.atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return { mediaType, bytes };
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function detectImageDimensions(bytes: Uint8Array): ImageDimensions {
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length >= 24 && pngSignature.every((value, index) => bytes[index] === value)) {
    return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) };
  }

  if (bytes.length >= 10 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { width: readUint16LE(bytes, 6), height: readUint16LE(bytes, 8) };
  }

  if (bytes.length >= 30 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 &&
    bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x58
  ) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }

  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 1 >= bytes.length) break;
      const segmentLength = readUint16BE(bytes, offset);
      if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

      const isSof = (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      );
      if (isSof && offset + 7 < bytes.length) {
        return {
          width: readUint16BE(bytes, offset + 5),
          height: readUint16BE(bytes, offset + 3)
        };
      }
      offset += segmentLength;
    }
  }

  return { width: 4, height: 3 };
}

function fitImageToAvailableArea(
  dimensions: ImageDimensions,
  style: SOPDocument['style']
): ImageDimensions {
  const page = parsePageSize(style.pageSize);
  const isLandscape = style.orientation === 'landscape';
  const pageWidth = isLandscape ? page.height : page.width;
  const pageHeight = isLandscape ? page.width : page.height;
  const availableWidthTwips = Math.max(
    1,
    pageWidth -
      parseLengthToTwips(style.margins.left, 1134, style.baseFontSize) -
      parseLengthToTwips(style.margins.right, 1134, style.baseFontSize)
  );
  const availableHeightTwips = Math.max(
    1,
    pageHeight -
      parseLengthToTwips(style.margins.top, 1134, style.baseFontSize) -
      parseLengthToTwips(style.margins.bottom, 1134, style.baseFontSize)
  );

  const maxWidth = Math.max(1, Math.min(640, Math.floor(availableWidthTwips / 15)));
  const maxHeight = Math.max(1, Math.min(760, Math.floor(availableHeightTwips / 15)));
  const width = Math.max(1, dimensions.width);
  const height = Math.max(1, dimensions.height);
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function assetAltText(blockAltText: string | undefined, asset: SOPAsset): string {
  return blockAltText || asset.altText || asset.filename || 'Embedded SOP image';
}

function collectSectionNodes(
  document: SOPDocument,
  sections: SOPSection[],
  result: SOPDocxPlanNode[],
  prefix: number[] = []
): void {
  sections.forEach((section, index) => {
    const numberParts = [...prefix, index + 1];
    const number = numberParts.join('.');
    const headingLevelNumber = Math.min(section.level + 1, 6) as SOPHeadingLevel;
    const configured = document.style.headingStyles[headingLevelNumber] ?? {};

    result.push({
      kind: 'heading',
      text: section.title ? number + ' ' + section.title : number,
      level: headingLevelNumber,
      fontSize: configured.fontSize,
      bold: configured.bold,
      italic: configured.italic
    });

    section.blocks.forEach(block => result.push(...blockToPlanNodes(document, block)));
    collectSectionNodes(document, section.sections, result, numberParts);
  });
}

function blockToPlanNodes(document: SOPDocument, block: SOPBlock): SOPDocxPlanNode[] {
  switch (block.type) {
    case 'paragraph':
      return [{ kind: 'paragraph', text: block.text }];

    case 'heading': {
      const configured = document.style.headingStyles[block.level] ?? {};
      return [{
        kind: 'heading',
        text: block.text,
        level: block.level,
        fontSize: configured.fontSize,
        bold: configured.bold,
        italic: configured.italic
      }];
    }

    case 'orderedList':
      return [{ kind: 'orderedList', items: [...block.items] }];

    case 'bulletList':
      return [{ kind: 'bulletList', items: [...block.items] }];

    case 'table':
      return [{
        kind: 'table',
        headers: block.headers ? [...block.headers] : undefined,
        rows: block.rows.map(row => [...row])
      }];

    case 'image': {
      const asset = document.assets.find(item => item.id === block.assetId);
      if (!asset) {
        return [{
          kind: 'callout',
          variant: 'caution',
          title: 'Image unavailable',
          text: 'Image asset "' + block.assetId + '" is not defined in the document.'
        }];
      }

      if (!asset.data) {
        return [{
          kind: 'callout',
          variant: 'note',
          title: 'Image data unavailable',
          text: 'Asset "' + asset.filename + '" is reference-only' + (asset.reference ? ': ' + asset.reference : '') + '.'
        }];
      }

      const parsed = parseDataUrl(asset.data);
      const supportedType = IMAGE_MEDIA_TYPES.get(asset.mediaType) ?? IMAGE_MEDIA_TYPES.get(parsed.mediaType);
      if (!supportedType) {
        return [{
          kind: 'callout',
          variant: 'note',
          title: 'Image format unavailable',
          text: 'Embedded image "' + asset.filename + '" uses unsupported media type "' + asset.mediaType + '".'
        }];
      }

      const fitted = fitImageToAvailableArea(detectImageDimensions(parsed.bytes), document.style);
      return [{
        kind: 'image',
        assetId: block.assetId,
        data: parsed.bytes,
        mediaType: supportedType,
        width: fitted.width,
        height: fitted.height,
        altText: assetAltText(block.altText, asset),
        caption: block.caption || asset.caption
      }];
    }

    case 'formula':
      return [{
        kind: 'formula',
        expression: block.expression,
        display: block.display,
        explanation: block.explanation
      }];

    case 'callout':
      return [{
        kind: 'callout',
        variant: block.variant,
        title: block.title,
        text: block.text
      }];

    case 'pageBreak':
      return [{ kind: 'pageBreak' }];
  }
}

function metadataEntries(document: SOPDocument): Array<[string, string]> {
  const fields: Array<[string, keyof SOPDocument['metadata']]> = [
    ['Document number', 'documentNumber'],
    ['Revision', 'revision'],
    ['Effective date', 'effectiveDate'],
    ['Review date', 'reviewDate'],
    ['Organization', 'organization'],
    ['Department', 'department']
  ];

  return fields
    .filter(([, field]) => document.metadata[field])
    .map(([label, field]) => [label, document.metadata[field]]);
}

export function buildSOPDocxFilename(document: SOPDocument): string {
  return buildSOPFilename(document).replace(/\.sop\.json$/i, '.sop.docx');
}

export function buildSOPDocxPlan(document: SOPDocument): SOPDocxPlan {
  const validation = validateSOPDocument(document);
  if (!validation.valid) {
    throw new Error('Cannot export invalid SOP document: ' + validation.errors.join(' '));
  }

  const nodes: SOPDocxPlanNode[] = [];
  collectSectionNodes(document, document.sections, nodes);

  return {
    title: document.metadata.title || 'Untitled SOP',
    metadata: metadataEntries(document),
    nodes,
    style: structuredClone(document.style),
    filename: buildSOPDocxFilename(document)
  };
}

function makeTextRun(
  text: string,
  style: SOPDocument['style'],
  options: { bold?: boolean; italic?: boolean; size?: number } = {}
): TextRun {
  return new TextRun({
    text,
    font: style.baseFont,
    size: Math.max(2, Math.round((options.size ?? style.baseFontSize) * 2)),
    bold: options.bold,
    italics: options.italic
  });
}

function spacingToTwips(value: string, style: SOPDocument['style']): number {
  return Math.max(0, parseLengthToTwips(value, 0, style.baseFontSize));
}

function headingParagraph(
  node: Extract<SOPDocxPlanNode, { kind: 'heading' }>,
  style: SOPDocument['style']
): Paragraph {
  return new Paragraph({
    heading: headingLevel(node.level),
    spacing: {
      before: spacingToTwips(style.spacing.section, style),
      after: spacingToTwips(style.spacing.paragraph, style)
    },
    children: [makeTextRun(node.text, style, {
      size: node.fontSize,
      bold: node.bold,
      italic: node.italic
    })]
  });
}

const DOCX_HEADING_LEVELS = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6
} as const;

function headingLevel(level: SOPHeadingLevel) {
  return DOCX_HEADING_LEVELS[level];
}

function metadataTable(plan: SOPDocxPlan): Table {
  const style = plan.style;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: plan.metadata.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ children: [makeTextRun(label, style, { bold: true })] })]
        }),
        new TableCell({
          children: [new Paragraph({ children: [makeTextRun(value, style)] })]
        })
      ]
    })),
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
    }
  });
}

function tableForPlan(
  node: Extract<SOPDocxPlanNode, { kind: 'table' }>,
  style: SOPDocument['style']
): Table {
  const rows: TableRow[] = [];
  if (node.headers) {
    rows.push(new TableRow({
      children: node.headers.map(cell => new TableCell({
        shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
        children: [new Paragraph({ children: [makeTextRun(cell, style, { bold: true })] })]
      }))
    }));
  }

  rows.push(...node.rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [makeTextRun(cell, style)] })]
    }))
  })));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
    }
  });
}

function calloutForPlan(
  node: Extract<SOPDocxPlanNode, { kind: 'callout' }>,
  style: SOPDocument['style']
): Table {
  const label = node.variant.toUpperCase();
  const title = node.title ? label + ': ' + node.title : label;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
        children: [
          new Paragraph({ children: [makeTextRun(title, style, { bold: true })] }),
          new Paragraph({ children: [makeTextRun(node.text, style)] })
        ]
      })]
    })],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' }
    }
  });
}

function nodesToDocx(plan: SOPDocxPlan): Array<Paragraph | Table> {
  const children: Array<Paragraph | Table> = [];
  const style = plan.style;

  children.push(new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [makeTextRun(plan.title, style, {
      size: Math.max(style.baseFontSize + 6, 18),
      bold: true
    })]
  }));

  if (plan.metadata.length > 0) {
    children.push(metadataTable(plan));
  }

  for (const node of plan.nodes) {
    switch (node.kind) {
      case 'paragraph':
        children.push(new Paragraph({
          spacing: { after: spacingToTwips(style.spacing.paragraph, style) },
          children: [makeTextRun(node.text, style)]
        }));
        break;

      case 'heading':
        children.push(headingParagraph(node, style));
        break;

      case 'orderedList':
        node.items.forEach(item => children.push(new Paragraph({
          numbering: { reference: 'sop-ordered-list', level: 0 },
          children: [makeTextRun(item, style)]
        })));
        break;

      case 'bulletList':
        node.items.forEach(item => children.push(new Paragraph({
          numbering: { reference: 'sop-bullet-list', level: 0 },
          children: [makeTextRun(item, style)]
        })));
        break;

      case 'table':
        children.push(tableForPlan(node, style));
        break;

      case 'image':
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: node.mediaType,
              data: node.data,
              transformation: {
                width: node.width,
                height: node.height
              },
              altText: {
                name: node.assetId,
                title: node.assetId,
                description: node.altText
              }
            })
          ]
        }));
        if (node.caption) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [makeTextRun(node.caption, style, {
              italic: true,
              size: Math.max(style.baseFontSize - 1, 8)
            })]
          }));
        }
        break;

      case 'formula':
        children.push(new Paragraph({
          spacing: { after: spacingToTwips(style.spacing.paragraph, style) },
          children: [makeTextRun(node.expression, style)]
        }));
        if (node.display) {
          children.push(new Paragraph({ children: [makeTextRun(node.display, style)] }));
        }
        if (node.explanation) {
          children.push(new Paragraph({
            children: [makeTextRun(node.explanation, style, {
              italic: true,
              size: Math.max(style.baseFontSize - 1, 8)
            })]
          }));
        }
        break;

      case 'callout':
        children.push(calloutForPlan(node, style));
        break;

      case 'pageBreak':
        children.push(new Paragraph({
          pageBreakBefore: true,
          children: [makeTextRun('', style)]
        }));
        break;
    }
  }

  return children;
}

export function buildSOPDocxDocument(document: SOPDocument): Document {
  const plan = buildSOPDocxPlan(document);
  const page = parsePageSize(plan.style.pageSize);
  const isLandscape = plan.style.orientation === 'landscape';
  const width = isLandscape ? page.height : page.width;
  const height = isLandscape ? page.width : page.height;
  const margins = {
    top: parseLengthToTwips(plan.style.margins.top, 1134, plan.style.baseFontSize),
    right: parseLengthToTwips(plan.style.margins.right, 1134, plan.style.baseFontSize),
    bottom: parseLengthToTwips(plan.style.margins.bottom, 1134, plan.style.baseFontSize),
    left: parseLengthToTwips(plan.style.margins.left, 1134, plan.style.baseFontSize)
  };

  return new Document({
    creator: 'SOP Builder',
    title: plan.title,
    description: 'Generated by the single-user SOP Builder',
    numbering: {
      config: [
        {
          reference: 'sop-ordered-list',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT
          }]
        },
        {
          reference: 'sop-bullet-list',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT
          }]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: {
            width,
            height,
            orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT
          },
          margin: margins
        }
      },
      children: nodesToDocx(plan)
    }]
  });
}

export async function createSOPDocxFile(
  document: SOPDocument
): Promise<{ filename: string; blob: Blob }> {
  const docxDocument = buildSOPDocxDocument(document);
  const blob = await Packer.toBlob(docxDocument);
  return {
    filename: buildSOPDocxFilename(document),
    blob
  };
}

export async function downloadSOPDocxDocument(document: SOPDocument): Promise<string> {
  const file = await createSOPDocxFile(document);
  const anchor = globalThis.document.createElement('a');
  const url = URL.createObjectURL(file.blob);

  anchor.href = url;
  anchor.download = file.filename;
  anchor.rel = 'noopener';

  try {
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }

  return file.filename;
}

import React from 'react';
import type { HeadingLevel, SOPAsset, SOPBlock, SOPDocument, SOPSection } from '../../model/sopDocument';
import { buildSOPFilename } from '../../model/sopDocumentFile';
import { validateSOPDocument } from '../../model/sopDocument';

interface Props {
  document: SOPDocument;
}

const PAGE_DIMENSIONS: Record<string, { width: string; height: string }> = {
  A3: { width: '297mm', height: '420mm' },
  A4: { width: '210mm', height: '297mm' },
  A5: { width: '148mm', height: '210mm' },
  LETTER: { width: '8.5in', height: '11in' },
  LEGAL: { width: '8.5in', height: '14in' }
};

const LENGTH_PATTERN = /^\d+(?:\.\d+)?(?:mm|cm|in|pt|pc|px|em|rem|%)$/i;

function safeCssLength(value: string, fallback: string): string {
  const normalized = value.trim();
  return LENGTH_PATTERN.test(normalized) ? normalized : fallback;
}

function safeCssNumber(value: number | undefined): string | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? String(value) + 'px'
    : undefined;
}

function safeCssFont(value: string): string {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function normalizedPageSize(document: SOPDocument): string {
  const normalized = document.style.pageSize.trim().toUpperCase();
  return PAGE_DIMENSIONS[normalized] ? normalized : 'A4';
}

function sectionHeadingLevel(section: SOPSection): HeadingLevel {
  return Math.min(section.level + 1, 6) as HeadingLevel;
}

function sectionNumber(
  sections: SOPSection[],
  targetId: string,
  prefix: number[] = []
): string | undefined {
  for (let index = 0; index < sections.length; index += 1) {
    const nextPrefix = [...prefix, index + 1];
    const section = sections[index];
    if (section.id === targetId) return nextPrefix.join('.');
    const nested = sectionNumber(section.sections, targetId, nextPrefix);
    if (nested) return nested;
  }
  return undefined;
}

function resolveAsset(document: SOPDocument, assetId: string): SOPAsset | undefined {
  return document.assets.find(asset => asset.id === assetId);
}

function renderImage(
  document: SOPDocument,
  block: Extract<SOPBlock, { type: 'image' }>,
  key: string
): React.ReactNode {
  const asset = resolveAsset(document, block.assetId);
  const altText = block.altText || asset?.altText || asset?.filename || 'Embedded SOP image';
  const caption = block.caption || asset?.caption;
  const isEmbeddedImage =
    Boolean(asset?.data?.startsWith('data:')) &&
    Boolean(asset?.mediaType?.toLowerCase().startsWith('image/'));

  return (
    <figure key={key} className="sop-print-image" data-print-block="image">
      {isEmbeddedImage ? (
        <img src={asset?.data} alt={altText} className="sop-print-image-content" />
      ) : (
        <div role="img" aria-label={altText} className="sop-print-image-placeholder">
          Image data unavailable for asset {block.assetId || '(empty asset ID)'}
          {asset?.reference ? ' · reference: ' + asset.reference : ''}
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function renderBlock(document: SOPDocument, block: SOPBlock, key: string): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <p key={key} data-print-block="paragraph">{block.text}</p>;

    case 'heading': {
      const Tag = ('h' + block.level) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const configured = document.style.headingStyles[block.level] ?? {};
      const fontSize = safeCssNumber(configured.fontSize);
      const style: React.CSSProperties = {
        ...(fontSize ? { fontSize } : {}),
        ...(configured.bold !== undefined ? { fontWeight: configured.bold ? 700 : 400 } : {}),
        ...(configured.italic !== undefined ? { fontStyle: configured.italic ? 'italic' : 'normal' } : {})
      };
      return React.createElement(Tag, {
        key,
        'data-print-block': 'heading',
        className: 'sop-print-heading',
        style
      }, block.text);
    }

    case 'orderedList':
      return (
        <ol key={key} data-print-block="orderedList">
          {block.items.map((item, index) => <li key={index}>{item}</li>)}
        </ol>
      );

    case 'bulletList':
      return (
        <ul key={key} data-print-block="bulletList">
          {block.items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      );

    case 'table':
      return (
        <div key={key} className="sop-print-table-wrap" data-print-block="table">
          <table className="sop-print-table">
            {block.headers && (
              <thead>
                <tr>{block.headers.map((header, index) => <th key={index} scope="col">{header}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'image':
      return renderImage(document, block, key);

    case 'formula':
      return (
        <div key={key} className="sop-print-formula" data-print-block="formula">
          <div className="sop-print-formula-expression">{block.expression}</div>
          {block.display && <div>{block.display}</div>}
          {block.explanation && <div className="sop-print-formula-explanation">{block.explanation}</div>}
        </div>
      );

    case 'callout':
      return (
        <aside key={key} className="sop-print-callout" data-print-block="callout" data-variant={block.variant}>
          <div className="sop-print-callout-title">
            {block.variant.toUpperCase()}{block.title ? ': ' + block.title : ''}
          </div>
          <div>{block.text}</div>
        </aside>
      );

    case 'pageBreak':
      return <div key={key} className="sop-print-page-break" data-print-block="pageBreak" aria-hidden="true" />;
  }
}

function renderSection(document: SOPDocument, section: SOPSection, number: string): React.ReactNode {
  const headingLevel = sectionHeadingLevel(section);
  const Tag = ('h' + headingLevel) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const configured = document.style.headingStyles[headingLevel] ?? {};
  const fontSize = safeCssNumber(configured.fontSize);
  const headingStyle: React.CSSProperties = {
    ...(fontSize ? { fontSize } : {}),
    ...(configured.bold !== undefined ? { fontWeight: configured.bold ? 700 : 400 } : {}),
    ...(configured.italic !== undefined ? { fontStyle: configured.italic ? 'italic' : 'normal' } : {})
  };

  return (
    <section key={section.id} className="sop-print-section">
      {React.createElement(Tag, {
        'data-print-section': section.id,
        className: 'sop-print-heading',
        style: headingStyle
      }, number + (section.title ? ' ' + section.title : ''))}
      {section.blocks.map((block, index) =>
        renderBlock(document, block, section.id + '-block-' + index)
      )}
      {section.sections.map(child => {
        const childNumber = sectionNumber(section.sections, child.id);
        const resolved = childNumber ? number + '.' + childNumber : number;
        return renderSection(document, child, resolved);
      })}
    </section>
  );
}

export function buildSOPPrintFilename(document: SOPDocument): string {
  return buildSOPFilename(document).replace(/\.sop\.json$/i, '.pdf');
}

export function buildSOPPrintCss(document: SOPDocument): string {
  const pageSize = normalizedPageSize(document);
  const margins = [
    safeCssLength(document.style.margins.top, '20mm'),
    safeCssLength(document.style.margins.right, '20mm'),
    safeCssLength(document.style.margins.bottom, '20mm'),
    safeCssLength(document.style.margins.left, '20mm')
  ].join(' ');

  return `
@page {
  size: ${pageSize} ${document.style.orientation};
  margin: ${margins};
}
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  body * {
    visibility: hidden !important;
  }
  #sop-print-document,
  #sop-print-document * {
    visibility: visible !important;
  }
  #sop-print-document {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: auto !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    box-shadow: none !important;
    font-family: ${safeCssFont(document.style.baseFont)} !important;
    font-size: ${document.style.baseFontSize}px !important;
    line-height: 1.5 !important;
  }
  #sop-print-screen {
    display: none !important;
  }
  .sop-print-page {
    width: auto !important;
    min-height: 0 !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .sop-print-section,
  .sop-print-heading,
  .sop-print-image,
  .sop-print-callout,
  .sop-print-formula {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sop-print-heading {
    break-after: avoid-page;
    page-break-after: avoid;
  }
  .sop-print-page-break {
    display: block;
    height: 0;
    break-before: page !important;
    page-break-before: always !important;
  }
  .sop-print-table-wrap {
    width: 100%;
    overflow: visible;
  }
  .sop-print-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
  }
  .sop-print-table thead {
    display: table-header-group;
  }
  .sop-print-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sop-print-table th,
  .sop-print-table td {
    border: 1px solid #94A3B8;
    padding: 4pt 6pt;
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  .sop-print-table th {
    font-weight: 700;
  }
  .sop-print-image-content {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }
  .sop-print-image-placeholder {
    border: 1px dashed #94A3B8;
    padding: 12pt;
    text-align: center;
  }
  .sop-print-image figcaption {
    margin-top: 4pt;
    text-align: center;
    font-size: 10pt;
    font-style: italic;
  }
  .sop-print-formula {
    border: 1px solid #CBD5E1;
    padding: 8pt;
  }
  .sop-print-formula-expression {
    font-family: "Courier New", monospace;
    white-space: pre-wrap;
  }
  .sop-print-formula-explanation {
    margin-top: 4pt;
    font-size: 10pt;
    font-style: italic;
  }
  .sop-print-callout {
    border: 1px solid #94A3B8;
    padding: 8pt;
    background: #F8FAFC;
  }
  .sop-print-callout-title {
    font-weight: 700;
    margin-bottom: 4pt;
    text-transform: uppercase;
  }
  [data-print-header="true"] {
    border-bottom: 1px solid #CBD5E1;
    padding-bottom: 8pt;
    margin-bottom: 12pt;
  }
  [data-print-header="true"] h1 {
    margin: 0 0 8pt;
  }
  [data-print-header="true"] dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 12pt;
    row-gap: 3pt;
    margin: 0;
    font-size: 9pt;
  }
  [data-print-header="true"] dl > div {
    display: contents;
  }
  [data-print-header="true"] dt {
    font-weight: 700;
  }
  [data-print-header="true"] dd {
    margin: 0;
  }
}
`;
}

export const SopDocumentPrint: React.FC<Props> = ({ document }) => {
  const validation = validateSOPDocument(document);

  if (!validation.valid) {
    return (
      <div id="sop-print-document" data-print-state="invalid" role="alert">
        <h1>Print unavailable</h1>
        <p>The current SOP contains validation errors and cannot be printed safely.</p>
        <ul>{validation.errors.map(error => <li key={error}>{error}</li>)}</ul>
      </div>
    );
  }

  const page = PAGE_DIMENSIONS[normalizedPageSize(document)];
  const screenPageStyle: React.CSSProperties = {
    width: document.style.orientation === 'landscape' ? page.height : page.width,
    minHeight: document.style.orientation === 'landscape' ? page.width : page.height,
    paddingTop: safeCssLength(document.style.margins.top, '20mm'),
    paddingRight: safeCssLength(document.style.margins.right, '20mm'),
    paddingBottom: safeCssLength(document.style.margins.bottom, '20mm'),
    paddingLeft: safeCssLength(document.style.margins.left, '20mm'),
    boxSizing: 'border-box',
    fontFamily: safeCssFont(document.style.baseFont),
    fontSize: document.style.baseFontSize + 'px',
    lineHeight: 1.5,
    background: '#fff',
    color: '#0f172a'
  };

  return (
    <div id="sop-print-document" data-print-state="valid">
      <article id="sop-print-page" className="sop-print-page" style={screenPageStyle}>
        <header data-print-header="true">
          <h1>{document.metadata.title || 'Untitled SOP'}</h1>
          <dl>
            {[
              ['Document number', document.metadata.documentNumber],
              ['Revision', document.metadata.revision],
              ['Effective date', document.metadata.effectiveDate],
              ['Review date', document.metadata.reviewDate],
              ['Organization', document.metadata.organization],
              ['Department', document.metadata.department]
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </header>

        {document.sections.map(section => {
          const number = sectionNumber(document.sections, section.id) ?? '1';
          return renderSection(document, section, number);
        })}
      </article>
    </div>
  );
};

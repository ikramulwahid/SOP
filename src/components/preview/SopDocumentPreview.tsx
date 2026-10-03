import React, { CSSProperties, Fragment, useMemo } from 'react';
import type {
  HeadingLevel,
  SOPAsset,
  SOPBlock,
  SOPDocument,
  SOPSection
} from '../../model/sopDocument';
import { validateSOPDocument } from '../../model/sopDocument';

interface Props {
  document: SOPDocument;
}

interface PreviewNode {
  key: string;
  element: React.ReactNode;
}

interface PreviewPage {
  key: string;
  nodes: PreviewNode[];
}

const pageDimensions: Record<string, { width: string; height: string }> = {
  A3: { width: '297mm', height: '420mm' },
  A4: { width: '210mm', height: '297mm' },
  A5: { width: '148mm', height: '210mm' },
  LETTER: { width: '8.5in', height: '11in' },
  LEGAL: { width: '8.5in', height: '14in' }
};

function sectionHeadingLevel(section: SOPSection): HeadingLevel {
  return Math.min(section.level + 1, 6) as HeadingLevel;
}

function getSectionNumber(sections: SOPSection[], id: string, prefix: number[] = []): string | undefined {
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    const nextPrefix = [...prefix, index + 1];
    if (section.id === id) return nextPrefix.join('.');
    const nested = getSectionNumber(section.sections, id, nextPrefix);
    if (nested) return nested;
  }
  return undefined;
}

function collectSectionEntries(
  sections: SOPSection[],
  result: Array<{ id: string; title: string; number: string }>,
  prefix: number[] = []
): void {
  sections.forEach((section, index) => {
    const numberParts = [...prefix, index + 1];
    result.push({
      id: section.id,
      title: section.title,
      number: numberParts.join('.')
    });
    collectSectionEntries(section.sections, result, numberParts);
  });
}

function resolveAsset(document: SOPDocument, assetId: string): SOPAsset | undefined {
  return document.assets.find(asset => asset.id === assetId);
}

function safePageDimensions(document: SOPDocument): { width: string; height: string } {
  const normalized = document.style.pageSize.trim().toUpperCase();
  const matched = pageDimensions[normalized] ?? pageDimensions.A4;
  return document.style.orientation === 'landscape'
    ? { width: matched.height, height: matched.width }
    : matched;
}

function createPageStyle(document: SOPDocument): CSSProperties {
  const dimensions = safePageDimensions(document);
  return {
    width: dimensions.width,
    minHeight: dimensions.height,
    maxWidth: '100%',
    boxSizing: 'border-box',
    marginInline: 'auto',
    paddingTop: document.style.margins.top,
    paddingRight: document.style.margins.right,
    paddingBottom: document.style.margins.bottom,
    paddingLeft: document.style.margins.left,
    fontFamily: document.style.baseFont,
    fontSize: document.style.baseFontSize + 'px',
    lineHeight: 1.5,
    background: 'white',
    overflowWrap: 'anywhere'
  };
}

function createPageGroups(nodes: PreviewNode[]): PreviewPage[] {
  const pages: PreviewPage[] = [];
  let current: PreviewNode[] = [];

  const pushCurrent = () => {
    pages.push({
      key: 'page-' + pages.length,
      nodes: current
    });
    current = [];
  };

  nodes.forEach(node => {
    if (node.key.endsWith(':pageBreak')) {
      pushCurrent();
      return;
    }
    current.push(node);
  });

  if (current.length > 0 || pages.length === 0) {
    pushCurrent();
  }

  return pages;
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function blockNodes(
  block: SOPBlock,
  key: string,
  document: SOPDocument
): PreviewNode {
  switch (block.type) {
    case 'paragraph':
      return {
        key,
        element: (
          <p data-preview-block="paragraph" className="whitespace-pre-wrap" style={{ marginBlock: document.style.spacing.paragraph }}>
            {block.text}
          </p>
        )
      };

    case 'heading': {
      const Heading = ('h' + block.level) as HeadingTag;
      const configured = document.style.headingStyles[block.level] ?? {};
      const headingStyle: CSSProperties = {
        ...(configured.fontSize !== undefined ? { fontSize: configured.fontSize + 'px' } : {}),
        ...(configured.bold !== undefined ? { fontWeight: configured.bold ? 700 : 400 } : {}),
        ...(configured.italic !== undefined ? { fontStyle: configured.italic ? 'italic' : 'normal' } : {}),
        marginBlock: document.style.spacing.paragraph
      };
      return {
        key,
        element: React.createElement(
          Heading,
          { 'data-preview-block': 'heading', style: headingStyle },
          block.text
        )
      };
    }

    case 'orderedList':
      return {
        key,
        element: (
          <ol data-preview-block="orderedList" className="list-decimal pl-6" style={{ marginBlock: document.style.spacing.paragraph }}>
            {block.items.map((item, index) => <li key={index}>{item}</li>)}
          </ol>
        )
      };

    case 'bulletList':
      return {
        key,
        element: (
          <ul data-preview-block="bulletList" className="list-disc pl-6" style={{ marginBlock: document.style.spacing.paragraph }}>
            {block.items.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        )
      };

    case 'table':
      return {
        key,
        element: (
          <div data-preview-block="table" className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              {block.headers && (
                <thead>
                  <tr>
                    {block.headers.map((header, index) => (
                      <th key={index} scope="col" className="border border-slate-300 bg-slate-50 px-2 py-1.5 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-slate-300 px-2 py-1.5 align-top">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      };

    case 'image': {
      const asset = resolveAsset(document, block.assetId);
      const src = asset?.data;
      const altText = block.altText || asset?.altText || asset?.filename || 'Embedded SOP image';
      const caption = block.caption || asset?.caption;
      return {
        key,
        element: (
          <figure data-preview-block="image" className="my-4 text-center">
            {src ? (
              <img
                src={src}
                alt={altText}
                className="mx-auto max-w-full"
                style={{ height: 'auto', maxHeight: '240mm' }}
              />
            ) : (
              <div role="img" aria-label={altText} className="mx-auto flex min-h-24 max-w-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-xs text-slate-500">
                Image data unavailable for asset {block.assetId || '(empty asset ID)'}
                {asset?.reference ? ' · reference: ' + asset.reference : ''}
              </div>
            )}
            {caption && <figcaption className="mt-2 text-xs text-slate-600">{caption}</figcaption>}
          </figure>
        )
      };
    }

    case 'formula':
      return {
        key,
        element: (
          <div data-preview-block="formula" className="my-4 rounded border border-slate-200 bg-slate-50 p-3">
            <div className="font-mono whitespace-pre-wrap text-sm">{block.expression}</div>
            {block.display && <div className="mt-2 whitespace-pre-wrap text-sm">{block.display}</div>}
            {block.explanation && <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">{block.explanation}</p>}
          </div>
        )
      };

    case 'callout':
      return {
        key,
        element: (
          <aside data-preview-block="callout" data-variant={block.variant} className="my-4 rounded border border-slate-300 bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <span aria-hidden="true" className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">{block.variant}</span>
              <div className="min-w-0">
                {block.title && <div className="font-semibold">{block.title}</div>}
                <div className="whitespace-pre-wrap">{block.text}</div>
              </div>
            </div>
          </aside>
        )
      };

    case 'pageBreak':
      return {
        key: key + ':pageBreak',
        element: null
      };
  }
}

function sectionNodes(
  document: SOPDocument,
  section: SOPSection,
  number: string
): PreviewNode[] {
  const headingLevel = sectionHeadingLevel(section);
  const Heading = ('h' + headingLevel) as HeadingTag;
  const result: PreviewNode[] = [];

  result.push({
    key: 'section-' + section.id,
    element: (
      <React.Fragment>
        {React.createElement(
          Heading,
          {
            id: 'preview-section-' + section.id,
            'data-preview-section': section.id,
            style: { marginBlock: document.style.spacing.section }
          },
          number + (section.title ? ' ' + section.title : '')
        )}
      </React.Fragment>
    )
  });

  section.blocks.forEach((block, index) => {
    result.push(blockNodes(block, 'section-' + section.id + '-block-' + index, document));
  });

  section.sections.forEach(child => {
    const childNumber = getSectionNumber(section.sections, child.id);
    const resolvedChildNumber = childNumber
      ? number + '.' + childNumber
      : number;
    result.push(...sectionNodes(document, child, resolvedChildNumber));
  });

  return result;
}

export const SopDocumentPreview: React.FC<Props> = ({ document }) => {
  const validation = useMemo(() => validateSOPDocument(document), [document]);
  const navigation = useMemo(() => {
    const entries: Array<{ id: string; title: string; number: string }> = [];
    collectSectionEntries(document.sections, entries);
    return entries;
  }, [document.sections]);

  if (!validation.valid) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">
        <h2 className="text-base font-semibold">Preview unavailable</h2>
        <p className="mt-1">The current SOP contains validation errors and cannot be previewed safely.</p>
        <ul className="mt-3 list-disc pl-5">
          {validation.errors.map(error => <li key={error}>{error}</li>)}
        </ul>
      </div>
    );
  }

  const nodes: PreviewNode[] = [];
  document.sections.forEach(section => {
    const number = getSectionNumber(document.sections, section.id) ?? '1';
    nodes.push(...sectionNodes(document, section, number));
  });

  const pages = createPageGroups(nodes);

  return (
    <div id="preview-document-top" className="min-w-0" data-preview-root>
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <nav aria-label="SOP preview section navigation">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</div>
          {navigation.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {navigation.map(entry => (
                <li key={entry.id} style={{ marginLeft: Math.max(0, entry.number.split('.').length - 1) * 12 }}>
                  <a
                    href={'#preview-section-' + entry.id}
                    className="text-sm text-slate-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {entry.number} {entry.title || 'Untitled section'}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No sections defined.</p>
          )}
        </nav>
      </div>

      <div className="space-y-6">
        {pages.map((page, index) => (
          <article
            key={page.key}
            aria-label={'Preview page ' + (index + 1)}
            data-preview-page={index + 1}
            className="mx-auto shadow-md ring-1 ring-slate-200"
            style={createPageStyle(document)}
          >
            {index === 0 && (
              <header className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold leading-tight">
                  {document.metadata.title || 'Untitled SOP'}
                </h1>
                <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                  {[
                    ['Document number', document.metadata.documentNumber],
                    ['Revision', document.metadata.revision],
                    ['Effective date', document.metadata.effectiveDate],
                    ['Review date', document.metadata.reviewDate],
                    ['Organization', document.metadata.organization],
                    ['Department', document.metadata.department]
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <Fragment key={label}>
                      <dt className="font-semibold text-slate-600">{label}</dt>
                      <dd className="text-slate-900">{value}</dd>
                    </Fragment>
                  ))}
                </dl>
              </header>
            )}
            {page.nodes.map(node => <Fragment key={node.key}>{node.element}</Fragment>)}
          </article>
        ))}
      </div>
    </div>
  );
};

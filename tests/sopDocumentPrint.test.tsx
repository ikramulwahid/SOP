/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

import {
  buildSOPPrintCss,
  buildSOPPrintFilename,
  SopDocumentPrint
} from '../src/components/print/SopDocumentPrint.tsx';
import { createEmptySOPDocument, type SOPDocument } from '../src/model/sopDocument.ts';

const ONE_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function sampleDocument(): SOPDocument {
  const document = createEmptySOPDocument();
  document.metadata = {
    title: 'Print Export Test',
    documentNumber: 'SOP/PRINT:001',
    revision: '4',
    effectiveDate: '2026-10-03',
    reviewDate: '2027-10-03',
    organization: 'Example Laboratory',
    department: 'Chemistry'
  };
  document.style = {
    ...document.style,
    pageSize: 'A4',
    orientation: 'landscape',
    margins: { top: '10mm', right: '15mm', bottom: '20mm', left: '25mm' },
    baseFont: 'Georgia',
    baseFontSize: 12,
    headingStyles: {
      2: { fontSize: 18, bold: true, italic: true }
    },
    spacing: { paragraph: '0.5em', section: '1em' }
  };
  document.assets = [{
    id: 'asset-1',
    filename: 'diagram.png',
    mediaType: 'image/png',
    data: ONE_PIXEL_PNG,
    altText: 'Process diagram',
    caption: 'Figure 1'
  }];
  document.sections = [{
    id: 'section-1',
    title: 'Scope',
    level: 1,
    blocks: [
      { type: 'paragraph', text: 'Paragraph content' },
      { type: 'heading', text: 'Content heading', level: 2 },
      { type: 'orderedList', items: ['One', 'Two'] },
      { type: 'bulletList', items: ['A', 'B'] },
      { type: 'table', headers: ['Column A', 'Column B'], rows: [['1', '2']] },
      { type: 'image', assetId: 'asset-1' },
      { type: 'formula', expression: 'a + b = c', display: 'a+b=c', explanation: 'Documented formula' },
      { type: 'callout', variant: 'warning', title: 'Warning', text: 'Use care.' },
      { type: 'pageBreak' }
    ],
    sections: [{
      id: 'section-1-1',
      title: 'Details',
      level: 2,
      blocks: [{ type: 'paragraph', text: 'Nested content' }],
      sections: []
    }]
  }, {
    id: 'section-2',
    title: 'Records',
    level: 1,
    blocks: [{ type: 'paragraph', text: 'Records content' }],
    sections: []
  }];
  return document;
}

test('renders title, metadata, numbering, all nine block types, styles, and page break semantics', () => {
  const document = sampleDocument();
  const before = JSON.stringify(document);
  const html = renderToStaticMarkup(<SopDocumentPrint document={document} />);

  assert.match(html, /Print Export Test/);
  assert.match(html, /SOP\/PRINT:001/);
  assert.match(html, /Example Laboratory/);
  assert.match(html, /1 Scope/);
  assert.match(html, /1\.1 Details/);
  assert.match(html, /2 Records/);
  assert.match(html, /Content heading/);

  for (const blockType of [
    'paragraph', 'heading', 'orderedList', 'bulletList', 'table',
    'image', 'formula', 'callout', 'pageBreak'
  ] as const) {
    assert.match(html, new RegExp('data-print-block="' + blockType + '"'));
  }

  assert.match(html, /Georgia/);
  assert.match(html, /12px/);
  assert.match(html, /font-size:18px/);
  assert.match(html, /font-weight:700/);
  assert.match(html, /font-style:italic/);
  assert.match(html, /10mm/);
  assert.match(html, /15mm/);
  assert.match(html, /20mm/);
  assert.match(html, /25mm/);
  assert.match(html, /@page/);
  assert.match(html, /#root\\s*\\{\\s*display:\\s*none\\s*!important/);
  assert.match(html, /#sop-print-dialog\\s*\\{[\\s\\S]*?position:\\s*static\\s*!important/);
  assert.match(html, /Process diagram/);
  assert.match(html, /Figure 1/);
  assert.match(html, /a \+ b = c/);
  assert.match(html, /Documented formula/);
  assert.doesNotMatch(html, /evaluate|execute|calculate/i);
  assert.equal(JSON.stringify(document), before);
});

test('builds print CSS with page size, orientation, margins, and pagination rules', () => {
  const css = buildSOPPrintCss(sampleDocument());

  assert.match(css, /size:\s*A4 landscape/);
  assert.match(css, /margin:\s*10mm 15mm 20mm 25mm/);
  assert.match(css, /break-before:\s*page/);
  assert.match(css, /page-break-before:\s*always/);
  assert.match(css, /table-header-group/);
  assert.match(css, /font-family:\s*"Georgia"/);
  assert.match(css, /font-size:\s*12px/);
  assert.match(css, /#root\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /#sop-print-dialog\s*\{[\s\S]*?position:\s*static\s*!important/);
  assert.match(css, /#sop-print-dialog > div\s*\{[\s\S]*?box-shadow:\s*none\s*!important/);
});

test('uses safe PDF filename behavior derived from WP-04', () => {
  const filename = buildSOPPrintFilename(sampleDocument());

  assert.equal(filename, 'SOP-PRINT-001 - Print Export Test.pdf');
  assert.doesNotMatch(filename, /[<>:"/\\|?*]/);
});

test('reference-only images remain placeholders and are never emitted as external images', () => {
  const document = sampleDocument();
  document.assets[0].data = undefined;
  document.assets[0].reference = 'https://example.invalid/image.png';

  const html = renderToStaticMarkup(<SopDocumentPrint document={document} />);

  assert.doesNotMatch(html, /<img[^>]+https:\/\/example\.invalid/);
  assert.match(html, /reference: https:\/\/example\.invalid\/image\.png/);
});

test('non-embedded image data is treated as a placeholder rather than fetched', () => {
  const document = sampleDocument();
  document.assets[0].data = 'https://example.invalid/image.png';

  const html = renderToStaticMarkup(<SopDocumentPrint document={document} />);

  assert.doesNotMatch(html, /<img[^>]+https:\/\/example\.invalid/);
  assert.match(html, /Image data unavailable for asset asset-1/);
});

test('invalid documents produce an explicit safe print error', () => {
  const document = sampleDocument();
  const invalid = structuredClone(document);
  (invalid as unknown as { schemaVersion: string }).schemaVersion = 'invalid';

  const html = renderToStaticMarkup(<SopDocumentPrint document={invalid} />);

  assert.match(html, /Print unavailable/);
  assert.match(html, /validation errors/i);
});

test('safe CSS falls back for unknown page size and malformed margins', () => {
  const document = sampleDocument();
  document.style.pageSize = 'unknown-size';
  document.style.margins = {
    top: 'bad',
    right: '15mm',
    bottom: '20mm',
    left: '25mm'
  };

  const css = buildSOPPrintCss(document);

  assert.match(css, /size:\s*A4 landscape/);
  assert.match(css, /margin:\s*20mm 15mm 20mm 25mm/);
});

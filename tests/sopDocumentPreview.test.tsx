/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

import { createEmptySOPDocument, type SOPDocument } from '../src/model/sopDocument.ts';
import { SopDocumentPreview } from '../src/components/preview/SopDocumentPreview.tsx';

function sampleDocument(): SOPDocument {
  const document = createEmptySOPDocument();
  document.metadata = {
    title: 'Preview SOP',
    documentNumber: 'SOP-001',
    revision: '2',
    effectiveDate: '2026-10-03',
    reviewDate: '2027-10-03',
    organization: 'Example Lab',
    department: 'Testing'
  };
  document.style = {
    ...document.style,
    pageSize: 'A4',
    orientation: 'landscape',
    baseFont: 'Georgia',
    baseFontSize: 12,
    margins: { top: '10mm', right: '11mm', bottom: '12mm', left: '13mm' },
    headingStyles: {
      2: { fontSize: 18, bold: true, italic: true }
    },
    spacing: { paragraph: '0.5em', section: '1em' }
  };
  document.assets = [{
    id: 'asset-1',
    filename: 'diagram.png',
    mediaType: 'image/png',
    data: 'data:image/png;base64,AAAA',
    altText: 'Process diagram',
    caption: 'Figure 1'
  }];
  document.sections = [{
    id: 'section-1',
    title: 'Scope',
    level: 1,
    blocks: [
      { type: 'paragraph', text: 'Paragraph content' },
      { type: 'heading', text: 'Content heading', level: 3 },
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
  }];
  return document;
}

test('renders metadata, nested sections, all block types, styles, and navigation', () => {
  const document = sampleDocument();
  const before = JSON.stringify(document);
  const html = renderToStaticMarkup(<SopDocumentPreview document={document} />);

  assert.match(html, /Preview SOP/);
  assert.match(html, /SOP-001/);
  assert.match(html, /Example Lab/);
  assert.match(html, /1 Scope/);
  assert.match(html, /1\.1 Details/);
  for (const blockType of ['paragraph', 'heading', 'orderedList', 'bulletList', 'table', 'image', 'formula', 'callout']) {
    assert.match(html, new RegExp('data-preview-block="' + blockType + '"'));
  }
  assert.match(html, /data-preview-page="1"/);
  assert.match(html, /data-preview-page="2"/);
  assert.match(html, /Georgia/);
  assert.match(html, /12px/);
  assert.match(html, /10mm/);
  assert.match(html, /Process diagram/);
  assert.match(html, /Figure 1/);
  assert.match(html, /a \+ b = c/);
  assert.match(html, /Documented formula/);
  assert.doesNotMatch(html, /mathjax|katex|evaluate|execute/i);
  assert.equal(JSON.stringify(document), before);
});

test('renders explicit page breaks as preview page boundaries', () => {
  const document = sampleDocument();
  const html = renderToStaticMarkup(<SopDocumentPreview document={document} />);

  const pageOne = html.indexOf('data-preview-page="1"');
  const pageTwo = html.indexOf('data-preview-page="2"');
  assert.ok(pageOne >= 0 && pageTwo > pageOne);
  assert.ok(html.indexOf('Nested content') > pageTwo);
});

test('handles a missing image asset without crashing', () => {
  const document = sampleDocument();
  document.sections[0].blocks = [{ type: 'image', assetId: 'missing-asset', altText: 'Missing diagram' }];

  const html = renderToStaticMarkup(<SopDocumentPreview document={document} />);
  assert.match(html, /Image data unavailable for asset missing-asset/);
  assert.match(html, /Missing diagram/);
});

test('rejects invalid documents through the preview validation state', () => {
  const document = sampleDocument();
  const invalid = structuredClone(document) as unknown as SOPDocument & { schemaVersion: string };
  invalid.schemaVersion = 'invalid';
  const html = renderToStaticMarkup(<SopDocumentPreview document={invalid} />);

  assert.match(html, /Preview unavailable/);
  assert.match(html, /validation errors/i);
});

test('reference-only image assets do not become remote images', () => {
  const document = sampleDocument();
  document.assets[0].data = undefined;
  document.assets[0].reference = 'local-reference';

  const html = renderToStaticMarkup(<SopDocumentPreview document={document} />);
  assert.doesNotMatch(html, /<img[^>]+src="local-reference"/);
  assert.match(html, /reference: local-reference/);
});

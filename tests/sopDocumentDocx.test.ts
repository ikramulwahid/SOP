/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { Packer } from 'docx';

import {
  buildSOPDocxDocument,
  buildSOPDocxFilename,
  buildSOPDocxPlan
} from '../src/model/sopDocumentDocx.ts';
import { createEmptySOPDocument, type SOPDocument } from '../src/model/sopDocument.ts';

const ONE_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function sampleDocument(): SOPDocument {
  const document = createEmptySOPDocument();
  document.metadata = {
    title: 'DOCX Export Test',
    documentNumber: 'SOP/001:TEST',
    revision: '3',
    effectiveDate: '2026-10-03',
    reviewDate: '2027-10-03',
    organization: 'Example Laboratory',
    department: 'Chemistry'
  };
  document.style = {
    ...document.style,
    pageSize: 'A4',
    orientation: 'landscape',
    margins: { top: '10mm', right: '11mm', bottom: '12mm', left: '13mm' },
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
      sections: [{
        id: 'section-1-1-1',
        title: 'Procedure',
        level: 3,
        blocks: [{ type: 'paragraph', text: 'Procedure content' }],
        sections: []
      }]
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

test('builds a DOCX plan with metadata, deterministic numbering, all block types, and styles', async () => {
  const document = sampleDocument();
  const before = JSON.stringify(document);
  const plan = buildSOPDocxPlan(document);

  assert.equal(plan.title, 'DOCX Export Test');
  assert.deepEqual(plan.metadata, [
    ['Document number', 'SOP/001:TEST'],
    ['Revision', '3'],
    ['Effective date', '2026-10-03'],
    ['Review date', '2027-10-03'],
    ['Organization', 'Example Laboratory'],
    ['Department', 'Chemistry']
  ]);
  assert.deepEqual(plan.nodes.filter(node => node.kind === 'heading').map(node => node.text), [
    '1 Scope',
    'Content heading',
    '1.1 Details',
    '1.1.1 Procedure',
    '2 Records'
  ]);

  const kinds = new Set(plan.nodes.map(node => node.kind));
  const blockKinds = ['paragraph', 'heading', 'orderedList', 'bulletList', 'table', 'image', 'formula', 'callout', 'pageBreak'] as const;
  for (const kind of blockKinds) {
    assert.ok(kinds.has(kind), 'missing ' + kind);
  }

  assert.equal(plan.style.orientation, 'landscape');
  assert.equal(plan.style.pageSize, 'A4');
  assert.equal(plan.style.baseFont, 'Georgia');
  assert.equal(plan.style.baseFontSize, 12);
  assert.equal(plan.style.margins.top, '10mm');

  const image = plan.nodes.find(node => node.kind === 'image');
  assert.ok(image && image.kind === 'image');
  assert.equal(image.altText, 'Process diagram');
  assert.equal(image.caption, 'Figure 1');
  assert.ok(image.width > 0 && image.height > 0);

  assert.equal(JSON.stringify(document), before);

  const bytes = await Packer.toBuffer(buildSOPDocxDocument(document));
  assert.ok(bytes.length > 1000);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
});

test('preserves image aspect ratio for supported embedded images', () => {
  const document = sampleDocument();
  const fakeWidePng = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10,
    0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 3, 32, 0, 0, 1, 144
  ]);
  let binary = '';
  for (const value of fakeWidePng) binary += String.fromCharCode(value);

  document.assets[0].data = 'data:image/png;base64,' + globalThis.btoa(binary);
  const plan = buildSOPDocxPlan(document);
  const image = plan.nodes.find(node => node.kind === 'image');

  assert.ok(image && image.kind === 'image');
  assert.ok(Math.abs(image.width / image.height - 2) < 5e-3);
});

test('reference-only image assets produce a safe placeholder and never fetch remotely', () => {
  const document = sampleDocument();
  document.assets[0].data = undefined;
  document.assets[0].reference = 'local-reference';

  const plan = buildSOPDocxPlan(document);
  const image = plan.nodes.find(node => node.kind === 'image');
  assert.equal(image, undefined);

  const placeholder = plan.nodes.find(
    node => node.kind === 'callout' && node.title === 'Image data unavailable'
  );
  assert.ok(placeholder && placeholder.kind === 'callout');
  assert.match(placeholder.text, /local-reference/);
});

test('rejects invalid documents before DOCX generation', () => {
  const document = sampleDocument();
  const invalid = structuredClone(document);
  (invalid as unknown as { schemaVersion: string }).schemaVersion = 'invalid';

  assert.throws(
    () => buildSOPDocxPlan(invalid),
    /Cannot export invalid SOP document/
  );
});

test('builds a safe DOCX filename from existing WP-04 filename behavior', () => {
  const document = sampleDocument();
  const filename = buildSOPDocxFilename(document);

  assert.equal(filename, 'SOP-001-TEST - DOCX Export Test.sop.docx');
  assert.doesNotMatch(filename, /[<>:"/\\|?*]/);
});

test('page breaks remain explicit plan nodes and do not create automatic pagination', () => {
  const document = sampleDocument();
  const plan = buildSOPDocxPlan(document);

  assert.equal(plan.nodes.filter(node => node.kind === 'pageBreak').length, 1);
  assert.equal(plan.nodes.findIndex(node => node.kind === 'pageBreak'), 9);
});

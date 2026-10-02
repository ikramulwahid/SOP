/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SOP_SCHEMA_VERSION,
  createEmptySOPDocument,
  deserializeSOPDocument,
  serializeSOPDocument,
  validateSOPDocument,
  type SOPDocument,
  type SOPBlock,
  type SOPSection
} from '../src/model/sopDocument';

function makeSection(id: string, title: string, blocks: SOPBlock[], sections: SOPSection[] = []): SOPSection {
  return { id, title, level: 1, blocks, sections };
}

function makeExampleDocument(): SOPDocument {
  const document = createEmptySOPDocument();

  document.metadata = {
    title: 'Example SOP',
    documentNumber: 'DOC-001',
    revision: '1',
    effectiveDate: '2026-10-02',
    reviewDate: '',
    organization: 'Example Organization',
    department: 'Operations'
  };

  document.sections = [
    makeSection('s1', 'Purpose', [
      { type: 'paragraph', text: 'Describe the purpose.' },
      { type: 'heading', text: 'Applicability', level: 2 },
      { type: 'bulletList', items: ['Item one', 'Item two'] },
      { type: 'orderedList', items: ['Step one', 'Step two'] }
    ]),
    makeSection('s2', 'Procedure', [
      {
        type: 'table',
        headers: ['Parameter', 'Value'],
        rows: [['Temperature', '25 °C'], ['Time', '30 min']]
      },
      {
        type: 'image',
        assetId: 'asset-1',
        caption: 'Process diagram',
        altText: 'Simple process diagram'
      },
      {
        type: 'formula',
        expression: 'x = a + b',
        display: 'x = a + b',
        explanation: 'Documented formula.'
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Caution',
        text: 'Follow the supplied instruction.'
      },
      { type: 'pageBreak' }
    ], [
      makeSection('s2-1', 'Subsection', [
        { type: 'paragraph', text: 'Nested section content.' }
      ])
    ])
  ];

  document.assets = [
    {
      id: 'asset-1',
      mediaType: 'image/png',
      filename: 'diagram.png',
      reference: 'asset-1'
    }
  ];

  document.revisionHistory = [
    {
      revision: '1',
      date: '2026-10-02',
      description: 'Initial document',
      preparedBy: 'User',
      approvedBy: ''
    }
  ];

  return document;
}

test('creates a valid empty document', () => {
  const document = createEmptySOPDocument();

  assert.equal(document.schemaVersion, SOP_SCHEMA_VERSION);
  assert.ok(document.id.length > 0);
  assert.deepEqual(document.sections, []);
  assert.deepEqual(document.revisionHistory, []);
  assert.deepEqual(document.assets, []);
  assert.equal(validateSOPDocument(document).valid, true);
});

test('represents all approved block types and nested sections', () => {
  const document = makeExampleDocument();
  const validation = validateSOPDocument(document);

  assert.equal(validation.valid, true, validation.errors.join('\n'));

  const types = document.sections.flatMap(section =>
    section.blocks.map(block => block.type)
  );

  assert.deepEqual(
    new Set(types),
    new Set([
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'table',
      'image',
      'formula',
      'callout',
      'pageBreak'
    ])
  );

  assert.equal(document.sections[1].sections[0].title, 'Subsection');
});

test('serializes and deserializes without losing structure', () => {
  const source = makeExampleDocument();
  const json = serializeSOPDocument(source);
  const restored = deserializeSOPDocument(json);

  assert.deepEqual(restored, source);
  assert.equal(serializeSOPDocument(restored), json);
});

test('rejects invalid schema versions and unknown blocks', () => {
  const document = makeExampleDocument();
  const unknown = structuredClone(document) as unknown as Record<string, unknown>;
  unknown.schemaVersion = '2.0';
  const sections = unknown.sections as Array<Record<string, unknown>>;
  const firstSection = sections[0];
  const blocks = firstSection.blocks as unknown[];
  blocks.push({ type: 'laboratoryCalculationEngine' });

  const validation = validateSOPDocument(unknown);

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.includes('schemaVersion')));
  assert.ok(validation.errors.some(error => error.includes('approved block type')));
});

test('rejects malformed tables and images without a valid asset source', () => {
  const document = makeExampleDocument();
  document.sections[1].blocks.push({
    type: 'table',
    headers: ['A', 'B'],
    rows: [['only one cell']]
  });
  document.sections[1].blocks.push({
    type: 'image',
    assetId: 'missing-asset'
  });

  document.assets = [];

  const validation = validateSOPDocument(document);

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.includes('match the number of header columns')));
  assert.ok(validation.errors.some(error => error.includes('unknown asset')));
});

test('does not execute formula content', () => {
  const document = makeExampleDocument();
  const formula = document.sections[1].blocks.find(block => block.type === 'formula');

  assert.ok(formula && formula.type === 'formula');
  assert.equal(formula.expression, 'x = a + b');
  assert.equal('evaluate' in formula, false);
});

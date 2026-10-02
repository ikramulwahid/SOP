/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createEmptySOPDocument,
  serializeSOPDocument,
  validateSOPDocument,
  type SOPBlock,
  type SOPDocument
} from '../src/model/sopDocument.ts';
import {
  addAssetReference,
  addBlock,
  addSection,
  duplicateBlock,
  indentSection,
  moveBlock,
  moveSection,
  outdentSection,
  removeBlock,
  removeSection,
  updateBlock,
  updateMetadata,
  updateRevisionHistory,
  updateSection,
  updateStyle
} from '../src/model/sopDocumentEditor.ts';

function documentWithSections(): SOPDocument {
  let document = createEmptySOPDocument();
  document = addSection(document);
  const first = document.sections[0];
  assert.ok(first);
  document = updateSection(document, first.id, { title: 'First' });
  document = addSection(document);
  const second = document.sections[1];
  assert.ok(second);
  document = updateSection(document, second.id, { title: 'Second' });
  return document;
}

test('section operations preserve nesting and levels', () => {
  let document = documentWithSections();
  const first = document.sections[0];
  const second = document.sections[1];
  assert.ok(first && second);

  document = indentSection(document, second.id);
  assert.equal(document.sections.length, 1);
  assert.equal(document.sections[0].sections[0].title, 'Second');
  assert.equal(document.sections[0].sections[0].level, 2);

  document = outdentSection(document, second.id);
  assert.equal(document.sections.length, 2);
  assert.equal(document.sections[1].title, 'Second');
  assert.equal(document.sections[1].level, 1);
  assert.equal(validateSOPDocument(document).valid, true);
});

test('nested section movement keeps sibling ordering and levels', () => {
  let document = documentWithSections();
  const first = document.sections[0];
  const second = document.sections[1];
  assert.ok(first && second);

  document = addSection(document, first.id);
  const child = document.sections[0].sections[0];
  assert.ok(child);
  document = updateSection(document, child.id, { title: 'Child' });

  document = addSection(document, first.id);
  const secondChild = document.sections[0].sections[1];
  assert.ok(secondChild);
  document = updateSection(document, secondChild.id, { title: 'Second child' });

  document = moveSection(document, secondChild.id, 'up');
  assert.equal(document.sections[0].sections[0].title, 'Second child');
  assert.equal(document.sections[0].sections[1].title, 'Child');

  document = indentSection(document, child.id);
  assert.equal(document.sections[0].sections[0].sections[0].title, 'Child');
  assert.equal(document.sections[0].sections[0].sections[0].level, 3);
});

test('section reorder, rename, and delete operate on the structural tree', () => {
  let document = documentWithSections();
  const firstId = document.sections[0].id;
  const secondId = document.sections[1].id;

  document = moveSection(document, secondId, 'up');
  assert.equal(document.sections[0].id, secondId);
  assert.equal(document.sections[1].id, firstId);

  document = moveSection(document, secondId, 'down');
  assert.equal(document.sections[1].id, secondId);

  document = updateSection(document, firstId, { title: 'Renamed' });
  assert.equal(document.sections[0].title, 'Renamed');

  document = addSection(document, firstId);
  const child = document.sections[0].sections[0];
  assert.ok(child);
  document = removeSection(document, firstId);
  assert.equal(document.sections.length, 1);
});

test('block add, update, reorder, duplicate, and remove preserve the document model', () => {
  let document = documentWithSections();
  const sectionId = document.sections[0].id;

  document = addBlock(document, sectionId, { type: 'paragraph', text: 'A' });
  document = addBlock(document, sectionId, { type: 'heading', text: 'B', level: 2 });
  document = addBlock(document, sectionId, { type: 'callout', variant: 'note', text: 'C' });

  document = updateBlock(document, sectionId, 0, { type: 'paragraph', text: 'Updated' });
  assert.equal((document.sections[0].blocks[0] as { text: string }).text, 'Updated');

  document = duplicateBlock(document, sectionId, 0);
  assert.equal(document.sections[0].blocks.length, 4);

  document = moveBlock(document, sectionId, 3, 'up');
  assert.equal(document.sections[0].blocks[2].type, 'callout');

  document = removeBlock(document, sectionId, 0);
  assert.equal(document.sections[0].blocks.length, 3);
  assert.equal(validateSOPDocument(document).valid, true);
});

test('metadata, revision history, style, and assets use WP-02 structures', () => {
  let document = createEmptySOPDocument();

  document = updateMetadata(document, { title: 'Generic SOP', revision: '1' });
  assert.equal(document.metadata.title, 'Generic SOP');

  document = updateRevisionHistory(document, [{
    revision: '1',
    date: '2026-10-02',
    description: 'Initial draft',
    preparedBy: 'User',
    approvedBy: ''
  }]);
  assert.equal(document.revisionHistory.length, 1);

  document = updateStyle(document, { orientation: 'landscape', baseFontSize: 12 });
  assert.equal(document.style.orientation, 'landscape');

  document = addAssetReference(document, {
    id: 'asset-1',
    mediaType: 'image/png',
    filename: 'diagram.png',
    reference: 'diagram-reference'
  });
  assert.equal(document.assets[0].id, 'asset-1');

  document = addSection(document);
  const sectionId = document.sections[0].id;
  document = addBlock(document, sectionId, { type: 'image', assetId: 'asset-1' });
  assert.equal(validateSOPDocument(document).valid, true);
});

test('all nine WP-02 block types can be inserted through the mutation layer', () => {
  let document = createEmptySOPDocument();
  document = addAssetReference(document, {
    id: 'asset-1',
    mediaType: 'image/png',
    filename: 'diagram.png',
    reference: 'diagram-reference'
  });
  document = addSection(document);
  const sectionId = document.sections[0].id;

  const blocks = [
    { type: 'paragraph', text: '' },
    { type: 'heading', text: '', level: 1 },
    { type: 'orderedList', items: [''] },
    { type: 'bulletList', items: [''] },
    { type: 'table', headers: ['A'], rows: [['B']] },
    { type: 'image', assetId: 'asset-1' },
    { type: 'formula', expression: '' },
    { type: 'callout', variant: 'warning', text: '' },
    { type: 'pageBreak' }
  ] satisfies SOPBlock[];

  for (const block of blocks) {
    document = addBlock(document, sectionId, block);
  }

  assert.equal(document.sections[0].blocks.length, 9);
  assert.equal(validateSOPDocument(document).valid, true);
});

test('invalid operations fail without mutating the original document', () => {
  const document = documentWithSections();
  const original = serializeSOPDocument(document);

  assert.throws(() => indentSection(document, document.sections[0].id));
  assert.throws(() => outdentSection(document, document.sections[0].id));
  assert.throws(() => moveSection(document, document.sections[0].id, 'up'));
  assert.throws(() => removeBlock(document, document.sections[0].id, 0));
  assert.throws(() => addBlock(document, document.sections[0].id, { type: 'image', assetId: 'missing' }));

  assert.equal(serializeSOPDocument(document), original);
  assert.equal(validateSOPDocument(document).valid, true);
});

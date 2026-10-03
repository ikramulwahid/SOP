/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptySOPDocument, deserializeSOPDocument, serializeSOPDocument } from '../src/model/sopDocument.ts';
import {
  buildSOPFilename,
  createAssetId,
  createEmbeddedImageAsset,
  createSOPFile,
  readSOPDocumentFile
} from '../src/model/sopDocumentFile.ts';

function makeDocument() {
  const document = createEmptySOPDocument();
  document.metadata.title = 'Example SOP';
  document.metadata.documentNumber = 'DOC:/001';
  document.sections = [{
    id: 'section-1',
    title: 'Purpose',
    level: 1,
    blocks: [
      { type: 'paragraph', text: 'Example content.' },
      { type: 'heading', text: 'Subheading', level: 2 },
      { type: 'orderedList', items: ['Step 1'] },
      { type: 'bulletList', items: ['Item 1'] },
      { type: 'table', headers: ['A', 'B'], rows: [['1', '2']] },
      { type: 'image', assetId: 'asset-1' },
      { type: 'formula', expression: 'x = a + b' },
      { type: 'callout', variant: 'note', text: 'Note' },
      { type: 'pageBreak' }
    ],
    sections: []
  }];
  document.assets = [{
    id: 'asset-1',
    mediaType: 'image/png',
    filename: 'diagram.png',
    data: 'data:image/png;base64,AAAA'
  }];
  document.revisionHistory = [{
    revision: '1',
    date: '2026-10-02',
    description: 'Initial draft',
    preparedBy: 'User',
    approvedBy: ''
  }];
  document.style.orientation = 'landscape';
  return document;
}

test('creates a valid local SOP file without changing the document model', () => {
  const document = makeDocument();
  const file = createSOPFile(document);

  assert.equal(file.filename, 'DOC--001 - Example SOP.sop.json');
  assert.equal(file.content, serializeSOPDocument(document));
  assert.equal(file.blob.type, 'application/json;charset=utf-8');
});

test('round-trips a complete document including nested structure and embedded assets', async () => {
  const source = makeDocument();
  const file = createSOPFile(source);
  const restored = await readSOPDocumentFile({ text: async () => file.content });

  assert.deepEqual(restored, source);
  assert.equal(serializeSOPDocument(restored), file.content);
});

test('rejects invalid SOP file content before loading', async () => {
  await assert.rejects(
    () => readSOPDocumentFile({ text: async () => '{"schemaVersion":"2.0"}' }),
    /Cannot deserialize invalid SOP document/
  );

  await assert.rejects(
    () => readSOPDocumentFile({ text: async () => 'not json' }),
    /Cannot deserialize SOP document/
  );
});

test('sanitizes unsafe filename characters and provides a fallback', () => {
  const document = createEmptySOPDocument();

  document.metadata.documentNumber = 'DOC:001/TEST';
  document.metadata.title = 'A SOP <Draft>?';
  assert.equal(buildSOPFilename(document), 'DOC-001-TEST - A SOP -Draft--.sop.json');

  document.metadata.documentNumber = '';
  document.metadata.title = '';
  assert.equal(buildSOPFilename(document), 'untitled.sop.json');
});

test('creates an asset ID when crypto.randomUUID is unavailable', () => {
  const originalCrypto = globalThis.crypto;

  try {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {}
    });

    const existing = new Set(['asset-existing']);
    const id = createAssetId(existing);

    assert.match(id, /^asset-/);
    assert.ok(!existing.has(id));
  } finally {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto
    });
  }
});

test('creates embedded image assets with the approved WP-02 asset structure', () => {
  const asset = createEmbeddedImageAsset(
    'asset-1',
    'diagram.png',
    'image/png',
    'data:image/png;base64,AAAA'
  );

  assert.deepEqual(asset, {
    id: 'asset-1',
    filename: 'diagram.png',
    mediaType: 'image/png',
    data: 'data:image/png;base64,AAAA'
  });
});

test('deserialized local file is validated using the existing SOP model', async () => {
  const source = makeDocument();
  const json = JSON.stringify(JSON.parse(serializeSOPDocument(source)), null, 2);
  const restored = await readSOPDocumentFile({ text: async () => json });

  assert.equal(restored.schemaVersion, '1.0');
  assert.equal(restored.sections[0].blocks.length, 9);
  assert.equal(restored.assets[0].data, 'data:image/png;base64,AAAA');
  assert.deepEqual(deserializeSOPDocument(json), restored);
});

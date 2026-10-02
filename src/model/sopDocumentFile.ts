import {
  deserializeSOPDocument,
  serializeSOPDocument,
  type SOPAsset,
  type SOPDocument
} from './sopDocument';

export const SOP_FILE_EXTENSION = '.sop.json';
const WINDOWS_INVALID_FILENAME_CHARACTERS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);
const WHITESPACE = /\\s+/g;

function sanitizeFilenamePart(value: string): string {
  const cleaned = Array.from(value.normalize('NFKC'), character => {
    const code = character.charCodeAt(0);
    return WINDOWS_INVALID_FILENAME_CHARACTERS.has(character) || (code >= 0 && code <= 31)
      ? '-'
      : character;
  })
    .join('')
    .replace(WHITESPACE, ' ')
    .trim()
    .replace(/[. ]+$/, '');

  if (!cleaned) return 'untitled';

  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(cleaned)) {
    return cleaned + '_';
  }

  return cleaned;
}

export function buildSOPFilename(document: SOPDocument): string {
  const parts = [
    document.metadata.documentNumber,
    document.metadata.title
  ]
    .map(value => sanitizeFilenamePart(value))
    .filter((value, index, values) => value !== 'untitled' || values.length === 1);

  const stem = parts.length > 0 ? parts.join(' - ') : 'untitled';
  return stem.slice(0, 160) + SOP_FILE_EXTENSION;
}

export function createSOPFile(document: SOPDocument): {
  filename: string;
  content: string;
  blob: Blob;
} {
  const content = serializeSOPDocument(document);
  return {
    filename: buildSOPFilename(document),
    content,
    blob: new Blob([content], { type: 'application/json;charset=utf-8' })
  };
}

export function downloadSOPDocument(document: SOPDocument): string {
  const file = createSOPFile(document);
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

export async function readSOPDocumentFile(file: Pick<File, 'text'>): Promise<SOPDocument> {
  const content = await file.text();
  return deserializeSOPDocument(content);
}

export function createEmbeddedImageAsset(
  id: string,
  filename: string,
  mediaType: string,
  data: string
): SOPAsset {
  return {
    id,
    filename,
    mediaType,
    data
  };
}

export function readImageFileAsAsset(file: File, id: string): Promise<SOPAsset> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Only image files can be added as embedded image assets.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result) {
        reject(new Error('The selected image could not be read.'));
        return;
      }

      resolve(createEmbeddedImageAsset(id, file.name, file.type, reader.result));
    };

    reader.onerror = () => {
      reject(new Error('The selected image could not be read.'));
    };

    reader.readAsDataURL(file);
  });
}

export function createAssetId(existingIds: Iterable<string>): string {
  const usedIds = new Set(existingIds);
  let id = '';
  do {
    id = 'asset-' + globalThis.crypto.randomUUID();
  } while (usedIds.has(id));
  return id;
}

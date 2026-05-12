import { Server } from '@hocuspocus/server';
import * as Y from 'yjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const LEGACY_DATA_DIR = path.resolve('./data');

const createEmptyDocument = () => new Y.Doc();

const isSafeDocumentName = (documentName) => /^[a-zA-Z0-9._-]{1,128}$/.test(documentName);

const ensureValidDocumentName = (documentName) => {
  if (!isSafeDocumentName(documentName)) {
    throw new Error('Invalid documentName');
  }
  return documentName;
};

const parseToken = (token) => {
  const raw = (token ?? '').trim();
  if (!raw) {
    throw new Error('Authentication failed');
  }

  const [role, expiresAtRaw] = raw.split(':');
  if (role !== 'readonly' && role !== 'write') {
    throw new Error('Authentication failed');
  }

  const expiresAtMs = expiresAtRaw ? Number(expiresAtRaw) : null;
  const expiresAt =
    expiresAtMs && Number.isFinite(expiresAtMs) ? new Date(expiresAtMs) : null;

  return {
    role,
    readOnly: role === 'readonly',
    expiresAt,
  };
};

const writeFileAtomic = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, data);
  try {
    await fs.rename(tempPath, filePath);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = err.code;
      if (code === 'EEXIST' || code === 'EPERM' || code === 'EACCES') {
        await fs.rm(filePath, { force: true });
        await fs.rename(tempPath, filePath);
        return;
      }
    }
    throw err;
  }
};

const getDocumentFilePath = (documentName) =>
  path.join(DATA_DIR, `${ensureValidDocumentName(documentName)}.yjs`);

const getCommentsFilePath = (documentName) =>
  path.join(DATA_DIR, `${ensureValidDocumentName(documentName)}.comments.json`);

const getLegacyDocumentFilePath = (documentName) =>
  path.join(LEGACY_DATA_DIR, `${ensureValidDocumentName(documentName)}.yjs`);

const extractComments = (document) => {
  const root = document.getMap('ins-comments-v2');
  const orderValue = root.get('order');
  const metaValue = root.get('meta');
  const commentsValue = root.get('comments');

  const order = orderValue instanceof Y.Array ? orderValue.toArray() : [];
  const meta = metaValue instanceof Y.Map ? metaValue : null;
  const comments = commentsValue instanceof Y.Map ? commentsValue : null;

  const threads = order.flatMap((threadId) => {
    if (!meta || !comments) {
      return [];
    }
    const threadMeta = meta.get(threadId);
    if (!(threadMeta instanceof Y.Map)) {
      return [];
    }
    const threadComments = comments.get(threadId);
    const commentList = threadComments instanceof Y.Array ? threadComments.toArray() : [];
    return [
      {
        id: threadId,
        quote: String(threadMeta.get('quote') ?? ''),
        anchor: threadMeta.get('anchor') ?? null,
        createdAt: Number(threadMeta.get('createdAt') ?? Date.now()),
        resolved: Boolean(threadMeta.get('resolved')),
        comments: commentList,
      },
    ];
  });

  return { threads };
};

const server = new Server({
  port: 1234,
  timeout: 30_000,
  debounce: 2_000,
  maxDebounce: 10_000,
  quiet: true,
  unloadImmediately: false,

  onAuthenticate: async (payload) => {
    ensureValidDocumentName(payload.documentName);
    const perm = parseToken(payload.token);

    if (perm.readOnly) {
      payload.connectionConfig.readOnly = true;
    }

    return {
      user: { role: perm.role },
      tokenExpiresAt: perm.expiresAt,
    };
  },

  beforeHandleMessage: async (data) => {
    const expiresAt = data.context?.tokenExpiresAt;
    if (expiresAt instanceof Date && expiresAt.getTime() <= Date.now()) {
      throw new Error('Token expired');
    }
  },

  onChange: async ({ context }) => {
    if (context?.user?.role === 'readonly') {
      throw new Error('Read-only user cannot write');
    }
  },

  onLoadDocument: async (payload) => {
    const documentName = ensureValidDocumentName(payload.documentName);
    const filePath = getDocumentFilePath(documentName);
    const legacyFilePath = getLegacyDocumentFilePath(documentName);

    try {
      const docData = await fs.readFile(filePath);
      const doc = new Y.Doc();
      Y.applyUpdate(doc, new Uint8Array(docData));
      return doc;
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
        try {
          const legacyData = await fs.readFile(legacyFilePath);
          const doc = new Y.Doc();
          Y.applyUpdate(doc, new Uint8Array(legacyData));
          return doc;
        } catch (legacyErr) {
          if (
            legacyErr &&
            typeof legacyErr === 'object' &&
            'code' in legacyErr &&
            legacyErr.code === 'ENOENT'
          ) {
            return createEmptyDocument();
          }
          throw legacyErr;
        }
      }
      throw err;
    }
  },

  onStoreDocument: async (payload) => {
    const documentName = ensureValidDocumentName(payload.documentName);
    const filePath = getDocumentFilePath(documentName);
    const commentsPath = getCommentsFilePath(documentName);

    const update = Y.encodeStateAsUpdate(payload.document);
    await writeFileAtomic(filePath, Buffer.from(update));

    const commentData = extractComments(payload.document);
    await writeFileAtomic(commentsPath, Buffer.from(JSON.stringify(commentData)));
  },
});

server.listen();

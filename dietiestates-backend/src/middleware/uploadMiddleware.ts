import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Request } from 'express';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

const allowedMimeToExtension: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function normalizeImmobileId(rawValue: unknown): string | undefined | null {
  if (rawValue === undefined || rawValue === null) return undefined;
  const firstValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const value = String(firstValue).trim();
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return null;
  return value;
}

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const rawImmobileId = req.query.immobileId ?? req.body?.immobileId ?? req.params?.immobileId;
    const immobileId = normalizeImmobileId(rawImmobileId);

    if (immobileId === null) {
      cb(new Error('immobileId non valido'), '');
      return;
    }

    const destinationPath = immobileId ? path.resolve(uploadsDir, immobileId) : uploadsDir;
    const isInsideUploadsDir =
      destinationPath === uploadsDir || destinationPath.startsWith(`${uploadsDir}${path.sep}`);

    if (!isInsideUploadsDir) {
      cb(new Error('Percorso upload non valido'), '');
      return;
    }

    fs.promises
      .mkdir(destinationPath, { recursive: true })
      .then(() => cb(null, destinationPath))
      .catch((error: unknown) => cb(error as Error, ''));
  },
  filename: (_req, file, cb) => {
    const ext = allowedMimeToExtension[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in allowedMimeToExtension) {
      cb(null, true);
      return;
    }
    cb(new Error('Solo immagini JPEG, PNG, WebP o GIF'));
  },
});

export const uploadMiddleware = upload.array('foto', 10);

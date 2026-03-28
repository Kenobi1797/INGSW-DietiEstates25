import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { Request } from 'express';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    // Estrai immobileId dai parametri della request (query, body, o params)
    const immobileId = req.query.immobileId || req.body?.immobileId || req.params?.immobileId;

    let destDir = uploadsDir;

    // Se immobileId è fornito, crea una sottocartella
    if (immobileId) {
      destDir = path.join(uploadsDir, String(immobileId));
    }

    // Ricrea sempre la destinazione se è stata rimossa manualmente a runtime.
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    cb(null, destDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo immagini JPEG, PNG, WebP o GIF'));
  },
});

export const uploadMiddleware = upload.array('foto', 10);

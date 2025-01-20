import express from "express";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import fs from 'fs/promises';

const imagerouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, "../../uploads");
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log("Created uploads directory:", uploadsDir);
  }
  return uploadsDir;
};

// Middleware to check if file exists
const checkFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

imagerouter.get("/:filename", async (req, res) => {
  const filename = req.params.filename;
  const { w, q } = req.query;
  const width = parseInt(w) || 1200;
  const quality = parseInt(q) || 75;

  try {
    // Ensure uploads directory exists
    const uploadsDir = await createUploadsDir();
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    const fileExists = await checkFileExists(filePath);
    if (!fileExists) {
      console.log(`File not found: ${filePath}`);
      return res.status(404).json({
        error: 'File not found',
        details: 'The requested image does not exist in the uploads directory',
        path: filePath
      });
    }

    // Process image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Determine output format based on input
    const format = metadata.format;
    const optimizedImage = image.resize(width, Math.round((metadata.height * width) / metadata.width), {
      fit: 'inside',
      withoutEnlargement: true
    });

    // Set format-specific options
    switch(format) {
      case 'jpeg':
      case 'jpg':
        optimizedImage.jpeg({ quality });
        res.type('image/jpeg');
        break;
      case 'png':
        optimizedImage.png({ quality: Math.min(quality, 100) });
        res.type('image/png');
        break;
      case 'webp':
        optimizedImage.webp({ quality });
        res.type('image/webp');
        break;
      default:
        optimizedImage.jpeg({ quality });
        res.type('image/jpeg');
    }

    // Add caching headers
    res.set('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
    res.set('Last-Modified', (new Date()).toUTCString());

    // Stream the optimized image
    optimizedImage.pipe(res);

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({
      error: 'Image processing error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default imagerouter;
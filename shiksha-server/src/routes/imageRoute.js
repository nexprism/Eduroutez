import express from "express";
import path from "path";
import sharp from "sharp";  // Sharp for image optimization
import { fileURLToPath } from "url";

const imagerouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

imagerouter.get("/:filename", async (req, res) => {
  const filename = req.params.filename;
  const { w, q } = req.query;  // Get width (w) and quality (q) from query parameters

  const width = parseInt(w) || 1200;  // Default width to 1200 if not provided
  const quality = parseInt(q) || 75;  // Default quality to 75 if not provided

  const filePath = path.join(__dirname, "../../uploads", filename);

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();  // Get image metadata

    // Resize the image if needed, maintaining aspect ratio
    const optimizedImage = image.resize(width, Math.round((metadata.height * width) / metadata.width));
    
    // Apply JPEG quality if the image format supports it
    optimizedImage.jpeg({ quality });

    // Set the appropriate content type
    res.type("image/jpeg");

    // Pipe the optimized image to the response
    optimizedImage.pipe(res);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(404).send("Image not found or error processing image");
  }
});

export default imagerouter;

import express from "express";

const imagerouter = express.Router();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

imagerouter.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  const options = {
    root: path.join(__dirname, "../../uploads"),
  };

  res.sendFile(filename, options, (err) => {
    if (err) {
      console.error("Error fetching image:", err);
      res.status(404).send("Image not found");
    }
  });
});

export default imagerouter;
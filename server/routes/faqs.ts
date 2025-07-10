import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const faqsPath = path.resolve(process.cwd(), "data/faqs.json");

// GET /api/faqs
router.get("/", (_req, res) => {
  fs.readFile(faqsPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read FAQs." });
    }
    try {
      const faqs = JSON.parse(data);
      res.json(faqs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Failed to parse FAQs data.', details: errorMessage });
    }
  });
});

export default router;

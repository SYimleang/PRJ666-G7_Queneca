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

// POST /api/faqs (for admin update)
router.post("/", (req, res) => {
  const updatedFaqs = req.body;
  fs.writeFile(faqsPath, JSON.stringify(updatedFaqs, null, 2), "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save FAQs." });
    }
    res.json({ message: "FAQs updated successfully." });
  });
});

export default router;

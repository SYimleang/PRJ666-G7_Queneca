import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const dataPath = path.resolve(process.cwd(), "data/termsData.json");

// GET /api/terms
router.get('/', (_req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error("File read error:", err);
      return res.status(500).json({ error: 'Failed to read terms data.' });
    }
    try {
      const terms = JSON.parse(data);
      console.log("Terms data loaded successfully:", terms);
      res.json(terms);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Failed to parse terms data.', details: errorMessage });
    }
  });
});

// POST /api/terms
router.post('/', (req, res) => {
  const newTerms = req.body;
  fs.writeFile(dataPath, JSON.stringify(newTerms, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save terms data.' });
    }
    res.json({ message: 'Terms updated successfully.' });
  });
});

export default router;

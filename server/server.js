const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { getRandomCombination, writeProcessed, writeAccepted, hasBeenProcessed, exportProcessedToCsv, exportAcceptedToCsv } = require('./helpers');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
console.log('Current __dirname:', __dirname);
console.log('Current working directory (process.cwd()):', process.cwd());

// Serve static files
const imagesPath = path.join(__dirname, 'server', 'images');
console.log('Serving images from:', imagesPath);
app.use('/images', express.static(imagesPath));
// app.use('/images', express.static('images'));
const buildPath = path.join(__dirname, '..', 'UI', 'web-build');
// app.use(express.static(path.join(__dirname, 'web-build')));
app.use(express.static(buildPath));

// API Routes
// GET /api/combination
app.get('/api/combination', async (req, res) => {
  let combination;
  let attempt = 0;

  do {
    combination = getRandomCombination();
    attempt++;
    if (attempt > 10000) return res.status(500).json({ error: 'Exhausted unique combinations.' });
  } while (await hasBeenProcessed(combination));

  res.json(combination);
});

// POST /api/decision
app.post('/api/decision', async (req, res) => {
  const { currentCombination, decisions } = req.body;

  await writeProcessed(currentCombination, decisions);


  const acceptedOnly = {};
  for (const [key, value] of Object.entries(decisions)) {
    if (value === 'accept') {
      acceptedOnly[key] = currentCombination[key];
    }
  }

  if (Object.keys(acceptedOnly).length > 0) {
    await writeAccepted(acceptedOnly);
  }

  // Return next combo
  let nextCombination;
  let attempts = 0;
  do {
    nextCombination = getRandomCombination();
    attempts++;
    if (attempts > 10000) return res.status(500).json({ error: 'Exhausted unique combinations.' });
  } while (await hasBeenProcessed(nextCombination));

  res.json(nextCombination);
});



app.get('/api/download/processed', (req, res) => {
  const filePath = path.resolve(__dirname, 'processed.csv');
  
 
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'processed.csv not found' });
  }
  

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="processed.csv"');
  

  res.sendFile(filePath);
});

app.get('/api/download/accepted', (req, res) => {
  const filePath = path.resolve(__dirname, 'accepted.csv');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'accepted.csv not found' });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="accepted.csv"');
  
  res.sendFile(filePath);
});



// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ error: 'API endpoint not found' });
//   }
  
//   res.sendFile(path.resolve(__dirname, 'web-build', 'index.html'));
// });

app.get((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
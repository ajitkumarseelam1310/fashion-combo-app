const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');

// Use /tmp for safe writing in production (like Render)
const PROCESSED_FILE = '/tmp/processed.csv';
const ACCEPTED_FILE = '/tmp/accepted.csv';

const headers = [
  { id: 'top', title: 'top' },
  { id: 'bottom', title: 'bottom' },
  { id: 'handbag', title: 'handbag' },
  { id: 'accessories', title: 'accessories' },
  { id: 'shoes', title: 'shoes' },
];

function formatCombo(combo) {
  return {
    top: combo.top?.filename || '',
    bottom: combo.bottom?.filename || '',
    handbag: combo.handbag?.filename || '',
    accessories: combo.accessories?.filename || '',
    shoes: combo.shoes?.filename || '',
  };
}

const imageDirs = {
  top: 'images/tops',
  bottom: 'images/bottoms',
  handbag: 'images/handbags',
  accessories: 'images/accessories',
  shoes: 'images/shoes',
};

const getRandomFromFolder = (folder) => {
  const imagesPath = path.join(__dirname, '..', 'server');
  const folderPath = path.join(imagesPath, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|png|jpeg)$/));
  if (files.length === 0) return null;
  const file = files[Math.floor(Math.random() * files.length)];
  return { filename: file, url: `http://localhost:3000/images/${path.basename(folder)}/${file}` };
};

function getRandomCombination() {
  const combo = {};
  for (const [key, folder] of Object.entries(imageDirs)) {
    combo[key] = getRandomFromFolder(folder);
  }
  return combo;
}

async function hasBeenProcessed(combo) {
  return new Promise((resolve) => {
    if (!fs.existsSync(PROCESSED_FILE)) return resolve(false);

    const combinationString = JSON.stringify(Object.values(combo).map(x => x.filename));
    let found = false;

    fs.createReadStream(PROCESSED_FILE)
      .pipe(csvParser())
      .on('data', (row) => {
        const processed = JSON.stringify([
          row.top, row.bottom, row.handbag, row.accessories, row.shoes,
        ]);
        if (combinationString === processed) found = true;
      })
      .on('end', () => resolve(found));
  });
}

async function writeProcessed(combo) {
  try {
    const writer = createCsvWriter({
      path: PROCESSED_FILE,
      header: headers,
      append: fs.existsSync(PROCESSED_FILE) && fs.statSync(PROCESSED_FILE).size > 0,
    });

    await writer.writeRecords([formatCombo(combo)]);
    console.log('✅ Processed combo written.');
  } catch (err) {
    console.error('❌ Error writing processed combo:', err);
  }
}

async function writeAccepted(combo) {
  try {
    const writer = createCsvWriter({
      path: ACCEPTED_FILE,
      header: headers,
      append: fs.existsSync(ACCEPTED_FILE) && fs.statSync(ACCEPTED_FILE).size > 0,
    });

    await writer.writeRecords([formatCombo(combo)]);
    console.log('✅ Accepted combo written.');
  } catch (err) {
    console.error('❌ Error writing accepted combo:', err);
  }
}

async function exportProcessedToCsv() {
  try {
    return fs.readFileSync(PROCESSED_FILE, 'utf8');
  } catch (error) {
    console.error('❌ Error exporting processed CSV:', error);
    return '';
  }
}

async function exportAcceptedToCsv() {
  try {
    return fs.readFileSync(ACCEPTED_FILE, 'utf8');
  } catch (error) {
    console.error('❌ Error exporting accepted CSV:', error);
    return '';
  }
}

module.exports = {
  getRandomCombination,
  hasBeenProcessed,
  writeProcessed,
  writeAccepted,
  exportProcessedToCsv,
  exportAcceptedToCsv
};

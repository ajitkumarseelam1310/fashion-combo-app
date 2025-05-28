const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');

const PROCESSED_FILE = path.join(__dirname,  'processed.csv');
const ACCEPTED_FILE = path.join(__dirname,  'accepted.csv');



const headers = [
  { id: 'top', title: 'top' },
  { id: 'bottom', title: 'bottom' },
  { id: 'handbag', title: 'handbag' },
  { id: 'accessories', title: 'accessories' },
  { id: 'shoes', title: 'shoes' },
];

function ensureHeader(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers.map(h => h.title).join(',') + '\n');
  }
}

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
  console.log(folderPath);
  const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|png|jpeg)$/));
  if (files.length === 0) return null;
  const file = files[Math.floor(Math.random() * files.length)];
  return { filename: file, url: `/images/${path.basename(folder)}/${file}` };
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
    if (!fs.existsSync('processed.csv')) return resolve(false);

    const combinationString = JSON.stringify(Object.values(combo).map(x => x.filename));
    let found = false;

    fs.createReadStream('processed.csv')
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





async function writeAccepted(combo) {
  const filePath = path.resolve('accepted.csv');
  ensureHeader(filePath);

  const writer = createCsvWriter({
    path: filePath,
    header: headers,
    append: true,
  });

  await writer.writeRecords([formatCombo(combo)]);
}

async function writeProcessed(combo) {
  const filePath = path.resolve('processed.csv');
  ensureHeader(filePath);

  const writer = createCsvWriter({
    path: filePath,
    header: headers,
    append: true,
  });

  await writer.writeRecords([formatCombo(combo)]);
}



async function exportProcessedToCsv() {
  try {
    const processed = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
    const csvData = processed.map(item => ({
      top: item.combination.top?.filename || '',
      bottom: item.combination.bottom?.filename || '',
      handbag: item.combination.handbag?.filename || '',
      accessories: item.combination.accessories?.filename || '',
      shoes: item.combination.shoes?.filename || '',
      timestamp: item.timestamp,
      decisions: JSON.stringify(item.decisions)  
    }));
    return csvData;
  } catch (error) {
    console.error('Error exporting processed data:', error);
    return [];
  }
}

async function exportAcceptedToCsv() {
  try {
    const accepted = JSON.parse(fs.readFileSync(ACCEPTED_FILE, 'utf8'));
    const csvData = accepted.map(item => ({
      top: item.combination.top?.filename || '',
      bottom: item.combination.bottom?.filename || '',
      handbag: item.combination.handbag?.filename || '',
      accessories: item.combination.accessories?.filename || '',
      shoes: item.combination.shoes?.filename || '',
      timestamp: item.timestamp
  
    }));
    return csvData;
  } catch (error) {
    console.error('Error exporting accepted data:', error);
    return [];
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

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const TABLES_DIR = path.join(DATA_DIR, 'tables');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory, tables directory, and database.json exist
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(TABLES_DIR)) {
    fs.mkdirSync(TABLES_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      tables: [
        {
          id: 'matrix-demo-sales',
          title: 'Quarterly Sales Performance Matrix',
          description: 'Regional sales metrics across Q1-Q4',
          headers: ['Region', 'Q1 Revenue ($)', 'Q2 Revenue ($)', 'Q3 Revenue ($)', 'Q4 Revenue ($)'],
          rows: [
            ['North America', '145000', '168000', '192000', '210000'],
            ['Europe', '98000', '112000', '125000', '140000'],
            ['Asia Pacific', '185000', '210000', '245000', '290000'],
            ['Latin America', '42000', '49000', '58000', '65000']
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'matrix-demo-grades',
          title: 'Student Academic Records',
          description: 'Semester test results by subject',
          headers: ['Student Name', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'],
          rows: [
            ['Emma Watson', '95', '92', '88', '99'],
            ['Liam Johnson', '84', '89', '76', '91'],
            ['Sophia Chen', '98', '96', '94', '97']
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    
    // Also save individual JSON files
    initialData.tables.forEach(t => saveIndividualJsonFile(t));
    console.log(`[Database] Initialized default database.json and tables directory at ${DATA_DIR}`);
  }
}

function getSafeFilename(title, id) {
  const sanitized = (title || 'matrix')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .slice(0, 40);
  return `${sanitized}_${id}.json`;
}

function saveIndividualJsonFile(tableData) {
  try {
    if (!fs.existsSync(TABLES_DIR)) {
      fs.mkdirSync(TABLES_DIR, { recursive: true });
    }
    const filename = getSafeFilename(tableData.title, tableData.id);
    const filePath = path.join(TABLES_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(tableData, null, 2), 'utf-8');
    return filename;
  } catch (err) {
    console.error('Error saving individual JSON file:', err);
    return null;
  }
}

function removeIndividualJsonFile(title, id) {
  try {
    const filename = getSafeFilename(title, id);
    const filePath = path.join(TABLES_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // Also check for any file containing id
    const files = fs.readdirSync(TABLES_DIR);
    files.forEach(f => {
      if (f.includes(id)) {
        try { fs.unlinkSync(path.join(TABLES_DIR, f)); } catch {}
      }
    });
  } catch (err) {
    console.error('Error removing individual JSON file:', err);
  }
}

function readDatabase() {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database.json:', err);
    return { tables: [] };
  }
}

function writeDatabase(data) {
  ensureDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Routes
// 1. Get all tables
app.get('/api/tables', (req, res) => {
  try {
    const db = readDatabase();
    res.json({ 
      success: true, 
      data: db.tables || [],
      storedFilesPath: TABLES_DIR
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get table by ID
app.get('/api/tables/:id', (req, res) => {
  try {
    const db = readDatabase();
    const table = (db.tables || []).find(t => t.id === req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Save or update table (with option saveAsNew to preserve all previous records)
app.post('/api/tables', (req, res) => {
  try {
    const { id, title, description, headers, rows, saveAsNew } = req.body;

    // Strict validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Table title cannot be empty' });
    }

    if (!Array.isArray(headers) || headers.length === 0) {
      return res.status(400).json({ success: false, message: 'Headers array is required and cannot be empty' });
    }

    if (headers.some(h => !h || !h.toString().trim())) {
      return res.status(400).json({ success: false, message: 'All column headers must be filled out' });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Rows array is required and cannot be empty' });
    }

    // Check for any blank cell in 2D array
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row)) {
        return res.status(400).json({ success: false, message: `Row ${r + 1} is not a valid array` });
      }
      for (let c = 0; c < headers.length; c++) {
        const val = row[c];
        if (val === undefined || val === null || val.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: `Empty field found at Row ${r + 1}, Column "${headers[c] || c + 1}"`,
            position: { row: r, col: c }
          });
        }
      }
    }

    const db = readDatabase();
    if (!db.tables) db.tables = [];

    const isNew = saveAsNew || !id;
    const finalId = isNew ? `matrix-${Date.now()}` : id;
    const now = new Date().toISOString();

    const existingIndex = !isNew ? db.tables.findIndex(t => t.id === finalId) : -1;

    const tableData = {
      id: finalId,
      title: title.trim(),
      description: description ? description.trim() : '',
      headers: headers.map(h => h.toString().trim()),
      rows: rows.map(r => r.slice(0, headers.length).map(v => v.toString().trim())),
      createdAt: existingIndex >= 0 ? db.tables[existingIndex].createdAt : now,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      // Update existing record
      db.tables[existingIndex] = tableData;
    } else {
      // Add as a new record without overwriting old ones
      db.tables.unshift(tableData);
    }

    // Write to main database.json
    writeDatabase(db);

    // Also write to standalone individual JSON file in data/tables/
    const individualFilename = saveIndividualJsonFile(tableData);

    res.json({
      success: true,
      message: existingIndex >= 0 
        ? `Updated "${tableData.title}" in database.json and data/tables/${individualFilename}`
        : `Saved new dataset "${tableData.title}" (${db.tables.length} total datasets stored in database.json & data/tables/)`,
      data: tableData,
      isNewRecord: existingIndex < 0,
      totalDatasets: db.tables.length,
      individualFile: individualFilename
    });
  } catch (error) {
    console.error('Error saving table:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Delete table
app.delete('/api/tables/:id', (req, res) => {
  try {
    const db = readDatabase();
    const tableToDelete = (db.tables || []).find(t => t.id === req.params.id);
    const initialLen = (db.tables || []).length;
    db.tables = (db.tables || []).filter(t => t.id !== req.params.id);

    if (db.tables.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    writeDatabase(db);
    if (tableToDelete) {
      removeIndividualJsonFile(tableToDelete.title, tableToDelete.id);
    }

    res.json({ success: true, message: 'Table deleted successfully from database.json and tables directory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    file: DB_FILE, 
    tablesDir: TABLES_DIR,
    timestamp: new Date().toISOString() 
  });
});

ensureDatabase();

app.listen(PORT, () => {
  console.log(`[Express Backend] 2D Array JSON Database Server running on http://localhost:${PORT}`);
  console.log(`[Express Backend] Individual JSON files stored at: ${TABLES_DIR}`);
});

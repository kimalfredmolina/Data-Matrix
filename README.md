# 2D Array Data Matrix Studio (React + JSON Database)

A powerful, intuitive, and modern web application built with **React** and **JSON File Persistence** to manage, manipulate, validate, and store 2-dimensional arrays.

---

## 🌟 Key Features & Requirements Matrix

| Requirement | Implementation |
| :--- | :--- |
| **Editable Header** | Inline editable dataset title, description, and dynamic column header names directly in the table. |
| **Add/Remove Rows & Columns** | 1-click column insertion/deletion, row insertion/deletion, and dynamic dimension prompts ($M \times N$). |
| **Input / Prompt Boxes for 2D Array** | High-performance interactive grid where every cell is an editable input box with keyboard navigation (`Arrow keys`, `Tab`, `Enter`). |
| **No Blank Fields Allowed** | Real-time visual validation with glowing alert borders, a sticky validation summary banner, and submit-blocking with automatic field focusing. |
| **Functional Submit/Save Button** | Saves directly to the backend database file (`data/database.json`) with animated feedback, plus standalone `.json` file export/import. |
| **Proper Storage & Display** | Tabbed presentation layer featuring: <br>• **Visual Data Table** with numeric totals/averages<br>• **Raw 2D Array / JSON Schema** with 1-click clipboard copy<br>• **Matrix Analytics** (dimensions, fill density, symmetry, types). |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS (Modern Slate & Indigo Glassmorphism), Lucide React Icons.
- **Database**: Local File-based JSON Database (`data/database.json`).
- **Backend**: Express.js REST API (`server.js`) with full validation middleware.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both the Backend JSON Server & Vite Frontend
```bash
npm run dev
```
- **Web Interface**: `http://localhost:5173`
- **Express Backend & JSON DB**: `http://localhost:5000`

---

## 📂 Project Structure

```
EndsoftTech/
├── data/
│   └── database.json          # Main JSON file database
├── src/
│   ├── components/
│   │   ├── Header.jsx         # App bar, DB status pill, import/export
│   │   ├── MatrixEditor.jsx   # 2D grid editor, header rename, row/col actions
│   │   ├── ValidationBanner.jsx # Real-time blank field error banner & focus
│   │   ├── DisplaySection.jsx # Visual table, raw 2D array / JSON, analytics
│   │   ├── DatabaseModal.jsx  # JSON database browser & collection manager
│   │   ├── ResizePromptModal.jsx # Matrix dimension generator prompt
│   │   └── Toast.jsx          # Notification toasts
│   ├── api.js                 # Express API client with offline fallback
│   ├── presets.js             # Sample template datasets
│   ├── App.jsx                # Core application state & validation engine
│   ├── App.css                # Polished design system & micro-animations
│   ├── index.css              # Global styles & typography
│   └── main.jsx
├── server.js                  # Express backend managing database.json
├── package.json
└── vite.config.js
```

---

## 💡 Screen Sharing Presentation Walkthrough

1. **Header & Metadata**: Click on the title or column headers to rename them inline.
2. **Dimension Manipulation**:
   - Click `+ Add Column` or `+ Add Row` to expand the matrix.
   - Click the trash icon on any row/column header to remove it.
   - Click **Set Dimensions** in the top navigation to prompt for custom $M \times N$ dimensions.
3. **Validation in Action**:
   - Clear any cell or header to see the instant validation banner with exact coordinate chips (e.g. `Row 2, Col 3`).
   - Click **Save Matrix** with an empty field to observe the save blocker and automatic scroll-to-focus on the empty field.
4. **JSON File Persistence**:
   - Complete the fields and click **Save Matrix (database.json)**.
   - Click **Saved Datasets** in the header to view all persistent tables inside `data/database.json`.
5. **Display & Export**:
   - Switch to **Visual Data Table** to view the formatted table with auto-calculated numeric summaries.
   - Switch to **2D Array / JSON Output** to copy the raw `string[][]` or export the dataset as a `.json` file.

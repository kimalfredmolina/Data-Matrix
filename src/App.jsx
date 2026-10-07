import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MatrixEditor from './components/MatrixEditor';
import ValidationBanner from './components/ValidationBanner';
import DisplaySection from './components/DisplaySection';
import DatabaseModal from './components/DatabaseModal';
import ResizePromptModal from './components/ResizePromptModal';
import Toast from './components/Toast';
import { api } from './api';
import { PRESETS, createEmptyMatrix } from './presets';
import './App.css';

export default function App() {
  // Main Table State initialized with the first rich sample preset
  const [tableData, setTableData] = useState(() => {
    return {
      id: PRESETS[0].id,
      title: PRESETS[0].name,
      description: PRESETS[0].description,
      headers: [...PRESETS[0].headers],
      rows: PRESETS[0].rows.map(r => [...r])
    };
  });

  const [savedTables, setSavedTables] = useState([]);
  const [dbStatus, setDbStatus] = useState({ connected: false });
  const [isSaving, setIsSaving] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  
  // Modals & Notifications
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Check Database connection & load tables on mount
  const loadDatabaseTables = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      setDbStatus(health);

      const res = await api.getTables();
      if (res.success && Array.isArray(res.data)) {
        setSavedTables(res.data);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  }, []);

  useEffect(() => {
    loadDatabaseTables();
  }, [loadDatabaseTables]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Real-time Validation Engine: Checks for any blank header or cell
  const validationErrors = useMemo(() => {
    const errors = [];

    // Title validation
    if (!tableData.title || tableData.title.trim() === '') {
      errors.push({
        type: 'title',
        message: 'Dataset Title cannot be empty'
      });
    }

    // Column Headers validation
    tableData.headers.forEach((header, colIdx) => {
      if (header === undefined || header === null || header.toString().trim() === '') {
        errors.push({
          type: 'header',
          colIndex: colIdx,
          message: `Column Header #${colIdx + 1} is empty`
        });
      }
    });

    // 2D Array Cells validation
    tableData.rows.forEach((row, rowIdx) => {
      tableData.headers.forEach((header, colIdx) => {
        const val = row[colIdx];
        if (val === undefined || val === null || val.toString().trim() === '') {
          errors.push({
            type: 'cell',
            rowIndex: rowIdx,
            colIndex: colIdx,
            colName: header || `Col ${colIdx + 1}`,
            message: `Empty field at Row ${rowIdx + 1}, Col ${colIdx + 1} (${header || 'Column'})`
          });
        }
      });
    });

    return errors;
  }, [tableData]);

  // Focus a specific field (used when clicking validation badges)
  const handleFocusField = (fieldKey) => {
    if (fieldKey === 'title') {
      const el = document.getElementById('matrix-title');
      if (el) {
        el.focus();
        el.select();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const el = document.getElementById(fieldKey);
    if (el) {
      el.focus();
      el.select();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Quick auto-fill sample values for blank fields
  const handleFillSampleData = () => {
    let fillCounter = 1;
    const newHeaders = tableData.headers.map((h, i) => 
      h && h.trim() !== '' ? h : `Metric ${i + 1}`
    );
    const newRows = tableData.rows.map((row, r) =>
      newHeaders.map((_, c) => {
        const val = row[c];
        if (val !== undefined && val !== null && val.toString().trim() !== '') {
          return val;
        }
        return `${(r + 1) * 10 + c + fillCounter++}`;
      })
    );
    const newTitle = tableData.title && tableData.title.trim() !== '' ? tableData.title : 'Custom 2D Matrix Data';

    setTableData({
      ...tableData,
      title: newTitle,
      headers: newHeaders,
      rows: newRows
    });
    showToast('Auto-filled remaining blank fields with sample data!', 'info');
  };

  // Save / Submit to JSON Database
  const handleSave = async (options = {}) => {
    setHasAttemptedSave(true);

    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      if (firstError.type === 'title') {
        handleFocusField('title');
      } else if (firstError.type === 'header') {
        handleFocusField(`header-${firstError.colIndex}`);
      } else if (firstError.type === 'cell') {
        handleFocusField(`cell-${firstError.rowIndex}-${firstError.colIndex}`);
      }
      showToast(`Cannot save: ${validationErrors.length} blank field(s) found! Please complete all entries.`, 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.saveTable(tableData, options);
      if (result.success) {
        setTableData(result.data);
        showToast(result.message || 'Saved successfully to database.json!', 'success');
        await loadDatabaseTables();
      } else {
        showToast(result.message || 'Error saving to database', 'warning');
      }
    } catch (err) {
      showToast('Save failed: ' + err.message, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const isExistingRecord = savedTables.some(t => t.id === tableData.id);

  // Create Fresh Empty Matrix
  const handleNewMatrix = () => {
    const fresh = createEmptyMatrix(3, 4, 'Untitled 2D Array');
    setTableData(fresh);
    setHasAttemptedSave(false);
    showToast('Created new 3 × 4 matrix table', 'info');
  };

  // Select table from Database Modal
  const handleSelectTableFromDb = (table) => {
    setTableData({
      id: table.id,
      title: table.title,
      description: table.description || '',
      headers: [...table.headers],
      rows: table.rows.map(r => [...r])
    });
    setHasAttemptedSave(false);
    showToast(`Loaded "${table.title}" from JSON database`, 'success');
  };

  // Delete table from Database Modal
  const handleDeleteTableFromDb = async (id) => {
    try {
      await api.deleteTable(id);
      showToast('Dataset deleted from database.json', 'info');
      await loadDatabaseTables();
      if (tableData.id === id) {
        handleNewMatrix();
      }
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'warning');
    }
  };

  // Apply custom dimensions from prompt modal
  const handleApplyDimensions = (targetRows, targetCols, fillType) => {
    let newHeaders = [];
    let newRows = [];

    // Columns
    for (let c = 0; c < targetCols; c++) {
      if (fillType === 'preserve' && tableData.headers[c]) {
        newHeaders.push(tableData.headers[c]);
      } else {
        newHeaders.push(`Column ${c + 1}`);
      }
    }

    // Rows & Cells
    let counter = 1;
    for (let r = 0; r < targetRows; r++) {
      const row = [];
      for (let c = 0; c < targetCols; c++) {
        if (fillType === 'preserve' && tableData.rows[r] && tableData.rows[r][c] !== undefined) {
          row.push(tableData.rows[r][c]);
        } else if (fillType === 'sequential') {
          row.push(`${counter++ * 10}`);
        } else {
          row.push('');
        }
      }
      newRows.push(row);
    }

    setTableData({
      ...tableData,
      headers: newHeaders,
      rows: newRows
    });
    showToast(`Applied matrix dimensions: ${targetRows} Rows × ${targetCols} Columns`, 'info');
  };

  // Direct JSON File Export
  const handleExportJson = () => {
    const exportPayload = {
      id: tableData.id,
      title: tableData.title,
      description: tableData.description,
      headers: tableData.headers,
      rows: tableData.rows,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(tableData.title || 'matrix_data').toLowerCase().replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON dataset file!', 'success');
  };

  // Direct JSON File Import
  const handleImportJson = (json) => {
    if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
      if (Array.isArray(json)) {
        // Raw 2D array import
        const colCount = Math.max(...json.map(r => (Array.isArray(r) ? r.length : 0)), 1);
        const headers = Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`);
        const rows = json.map(r => 
          Array.isArray(r) 
            ? Array.from({ length: colCount }, (_, i) => (r[i] !== undefined ? String(r[i]) : ''))
            : Array.from({ length: colCount }, () => '')
        );
        setTableData({
          id: `matrix-${Date.now()}`,
          title: 'Imported 2D Array',
          description: 'Imported from raw 2D JSON array',
          headers,
          rows
        });
        showToast('Imported raw 2D array successfully!', 'success');
        return;
      }
      showToast('Invalid JSON file format. Expected { headers: [], rows: [[]] }', 'warning');
      return;
    }

    setTableData({
      id: json.id || `matrix-${Date.now()}`,
      title: json.title || 'Imported Dataset',
      description: json.description || '',
      headers: json.headers.map(h => String(h)),
      rows: json.rows.map(r => (Array.isArray(r) ? r.map(c => String(c || '')) : []))
    });
    setHasAttemptedSave(false);
    showToast('JSON Dataset imported successfully!', 'success');
  };

  return (
    <div className="app-root">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Application Header */}
      <Header
        onNewMatrix={handleNewMatrix}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenResizeModal={() => setIsResizeModalOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        dbStatus={dbStatus}
        datasetCount={savedTables.length}
      />

      <main className="main-content-layout">
        {/* Requirement #4: Validation Banner (No blank fields allowed) */}
        <ValidationBanner
          validationErrors={validationErrors}
          onFocusField={handleFocusField}
          onFillSampleData={handleFillSampleData}
        />

        {/* Requirements #1, #2, #3, #5: 2D Array Grid Editor */}
        <MatrixEditor
          tableData={tableData}
          onChange={setTableData}
          onSave={handleSave}
          isSaving={isSaving}
          validationErrors={validationErrors}
          hasAttemptedSave={hasAttemptedSave}
          isExistingRecord={isExistingRecord}
        />

        {/* Requirement #6: Stored Data & 2D Array Display Section */}
        <DisplaySection
          tableData={tableData}
          onCopyToast={showToast}
        />
      </main>

      {/* JSON Database Collections Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        savedTables={savedTables}
        currentTableId={tableData.id}
        onSelectTable={handleSelectTableFromDb}
        onDeleteTable={handleDeleteTableFromDb}
        onNewTable={handleNewMatrix}
        dbStatus={dbStatus}
      />

      {/* Custom Matrix Dimensions Modal */}
      <ResizePromptModal
        isOpen={isResizeModalOpen}
        onClose={() => setIsResizeModalOpen(false)}
        currentRows={tableData.rows.length}
        currentCols={tableData.headers.length}
        onApplyDimensions={handleApplyDimensions}
      />

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>2D Array Matrix Manager · Built with React &amp; JSON Database Persistence</span>
          <span className="footer-sep">·</span>
          <span>All fields validated against empty/blank values</span>
        </div>
      </footer>
    </div>
  );
}

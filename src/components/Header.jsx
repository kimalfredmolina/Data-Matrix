import React from 'react';
import {
  Table2,
  Database,
  Download,
  Upload,
  PlusCircle,
  Grid3X3,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Header({
  onNewMatrix,
  onOpenDatabaseModal,
  onOpenResizeModal,
  onExportJson,
  onImportJson,
  dbStatus,
  datasetCount
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportJson(json);
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Table2 className="brand-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">Data Matrix Application</h1>
            </div>
            <p className="brand-subtitle">
              Data Matrix &amp; File Persistence
            </p>
          </div>
        </div>

        {/* Database Status & Actions */}
        <div className="header-actions">
          {/* DB Indicator */}
          <div
            className={`status-pill ${dbStatus.connected ? 'connected' : 'local'}`}
            title={dbStatus.connected ? 'Connected to database.json server' : 'Running in browser local mode'}
          >
            {dbStatus.connected ? (
              <>
                <CheckCircle2 size={14} className="status-icon" />
                <span>database.json Online</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="status-icon" />
                <span>Local Storage Mode</span>
              </>
            )}
          </div>

          {/* Database Collections Drawer Button */}
          <button
            type="button"
            className="btn-header secondary"
            onClick={onOpenDatabaseModal}
            title="Browse all saved datasets in JSON database"
          >
            <Database size={16} />
            <span>Saved Datasets</span>
            {datasetCount > 0 && <span className="counter-pill">{datasetCount}</span>}
          </button>

          {/* Grid Dimensions Prompt */}
          <button
            type="button"
            className="btn-header secondary"
            onClick={onOpenResizeModal}
            title="Create or resize matrix with custom rows & cols"
          >
            <Grid3X3 size={16} />
            <span>Set Dimensions</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            className="btn-header secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import 2D array from .json file"
          >
            <Upload size={16} />
            <span>Import JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />

          {/* Export JSON */}
          <button
            type="button"
            className="btn-header secondary"
            onClick={onExportJson}
            title="Export current 2D array as JSON file"
          >
            <Download size={16} />
            <span>Export JSON</span>
          </button>

          {/* New Empty Table */}
          <button
            type="button"
            className="btn-header primary"
            onClick={onNewMatrix}
            title="Create a fresh new 2D array"
          >
            <PlusCircle size={16} />
            <span>New Table</span>
          </button>
        </div>
      </div>
    </header>
  );
}

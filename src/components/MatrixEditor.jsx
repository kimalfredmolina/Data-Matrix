import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Table,
  Edit3,
  FileText,
  AlertCircle,
  Hash,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { PRESETS, getPresetWithNewId } from '../presets';

export default function MatrixEditor({
  tableData,
  onChange,
  onSave,
  isSaving,
  validationErrors,
  hasAttemptedSave,
  isExistingRecord
}) {
  const [activeCell, setActiveCell] = useState(null); // { row, col }
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  // Quick error lookup map for fast rendering
  const errorMap = React.useMemo(() => {
    const map = {
      title: false,
      headers: {},
      cells: {}
    };
    if (validationErrors) {
      validationErrors.forEach(err => {
        if (err.type === 'title') map.title = true;
        if (err.type === 'header') map.headers[err.colIndex] = true;
        if (err.type === 'cell') {
          map.cells[`${err.rowIndex}-${err.colIndex}`] = true;
        }
      });
    }
    return map;
  }, [validationErrors]);

  const rowsCount = tableData.rows.length;
  const colsCount = tableData.headers.length;

  // Header Title & Description change
  const handleTitleChange = (e) => {
    onChange({ ...tableData, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    onChange({ ...tableData, description: e.target.value });
  };

  // Column Header edit
  const handleHeaderChange = (colIndex, value) => {
    const newHeaders = [...tableData.headers];
    newHeaders[colIndex] = value;
    onChange({ ...tableData, headers: newHeaders });
  };

  // Cell change
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = tableData.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const newRow = [...row];
      newRow[colIndex] = value;
      return newRow;
    });
    onChange({ ...tableData, rows: newRows });
  };

  // Add Row
  const handleAddRow = (insertIndex = null) => {
    const newRow = Array.from({ length: colsCount }, () => '');
    let newRows = [...tableData.rows];
    if (insertIndex !== null && insertIndex >= 0) {
      newRows.splice(insertIndex, 0, newRow);
    } else {
      newRows.push(newRow);
    }
    onChange({ ...tableData, rows: newRows });
  };

  // Remove Row
  const handleRemoveRow = (rowIndex) => {
    if (rowsCount <= 1) {
      alert('The matrix must contain at least 1 row.');
      return;
    }
    const newRows = tableData.rows.filter((_, idx) => idx !== rowIndex);
    onChange({ ...tableData, rows: newRows });
  };

  // Add Column
  const handleAddColumn = (insertIndex = null) => {
    const newColName = `Column ${colsCount + 1}`;
    let newHeaders = [...tableData.headers];
    let newRows = tableData.rows.map(row => [...row]);

    if (insertIndex !== null && insertIndex >= 0) {
      newHeaders.splice(insertIndex, 0, newColName);
      newRows = newRows.map(row => {
        const copy = [...row];
        copy.splice(insertIndex, 0, '');
        return copy;
      });
    } else {
      newHeaders.push(newColName);
      newRows = newRows.map(row => [...row, '']);
    }

    onChange({ ...tableData, headers: newHeaders, rows: newRows });
  };

  // Remove Column
  const handleRemoveColumn = (colIndex) => {
    if (colsCount <= 1) {
      alert('The matrix must contain at least 1 column.');
      return;
    }
    const newHeaders = tableData.headers.filter((_, idx) => idx !== colIndex);
    const newRows = tableData.rows.map(row => row.filter((_, idx) => idx !== colIndex));
    onChange({ ...tableData, headers: newHeaders, rows: newRows });
  };

  // Load Preset (generates a new unique ID so it doesn't overwrite)
  const handleLoadPreset = (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      const presetWithId = getPresetWithNewId(preset);
      onChange(presetWithId);
    }
  };

  // Clear All Cells
  const handleClearMatrix = () => {
    if (confirm('Are you sure you want to clear all cell contents? Headers will be preserved.')) {
      const clearedRows = tableData.rows.map(row => row.map(() => ''));
      onChange({ ...tableData, rows: clearedRows });
    }
  };

  // Fill with Sample Numbers
  const handleFillSequential = () => {
    let counter = 1;
    const filledRows = tableData.rows.map((row, r) =>
      row.map((val, c) => (val && val.trim() !== '' ? val : `${counter++ * 10}`))
    );
    onChange({ ...tableData, rows: filledRows });
  };

  // Keyboard Navigation across the 2D grid
  const handleKeyDown = (e, rowIndex, colIndex) => {
    const { key } = e;
    let targetRow = rowIndex;
    let targetCol = colIndex;

    if (key === 'ArrowRight') {
      if (e.target.selectionStart === e.target.value.length) {
        targetCol = Math.min(colsCount - 1, colIndex + 1);
      }
    } else if (key === 'ArrowLeft') {
      if (e.target.selectionStart === 0) {
        targetCol = Math.max(0, colIndex - 1);
      }
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      targetRow = Math.min(rowsCount - 1, rowIndex + 1);
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      targetRow = Math.max(0, rowIndex - 1);
    } else if (key === 'Enter') {
      e.preventDefault();
      if (rowIndex < rowsCount - 1) {
        targetRow = rowIndex + 1;
      } else {
        // Automatically add a new row on Enter at last cell
        handleAddRow();
        targetRow = rowIndex + 1;
      }
    }

    if (targetRow !== rowIndex || targetCol !== colIndex) {
      const nextInput = document.getElementById(`cell-${targetRow}-${targetCol}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  return (
    <section className="matrix-editor-section">
      {/* Table Header Metadata Controls */}
      <div className="editor-card header-meta-card">
        <div className="meta-left">
          <div className="meta-input-group">
            <div className="meta-label-row">
              <label htmlFor="matrix-title" className="meta-label">
                <FileText size={15} />
                <span>Dataset / Matrix Title</span>
                <span className="required-star">*</span>
              </label>
              {errorMap.title && (
                <span className="meta-error-text">Title is required</span>
              )}
            </div>
            <input
              id="matrix-title"
              type="text"
              className={`meta-input title-input ${errorMap.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Sales Revenue Matrix, Student Grades, Inventory..."
              value={tableData.title}
              onChange={handleTitleChange}
            />
          </div>

          <div className="meta-input-group description-group">
            <label htmlFor="matrix-description" className="meta-label">
              <Edit3 size={15} />
              <span>Description / Notes</span>
            </label>
            <input
              id="matrix-description"
              type="text"
              className="meta-input"
              placeholder="Optional brief description of this 2-dimensional dataset"
              value={tableData.description || ''}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="meta-right">
          <div className="dimension-badge" title="Current Matrix Dimensions">
            <Hash size={14} />
            <span>{rowsCount} Rows × {colsCount} Columns</span>
            <span className="cell-total-badge">({rowsCount * colsCount} cells)</span>
          </div>

          <div className="editor-quick-actions">
            {/* Presets dropdown */}
            <div className="preset-selector-wrap">
              <label htmlFor="preset-select" className="preset-label">Load Template:</label>
              <select
                id="preset-select"
                className="preset-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadPreset(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="" disabled>Choose Sample Matrix...</option>
                {PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn-toolbar"
              onClick={handleFillSequential}
              title="Quickly fill remaining blanks with sample numbers"
            >
              <Sparkles size={14} />
              <span>Fill Blanks</span>
            </button>

            <button
              type="button"
              className="btn-toolbar danger-ghost"
              onClick={handleClearMatrix}
              title="Clear all cell values"
            >
              <RotateCcw size={14} />
              <span>Clear Cells</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 2D Array Matrix Grid */}
      <div className="editor-card matrix-grid-card">
        <div className="matrix-toolbar-header">
          <div className="toolbar-title-wrap">
            <Table size={18} className="text-accent" />
            <h3 className="toolbar-title">Data Matrix Table</h3>
            <span className="toolbar-hint">
              Click any cell or header to edit. Use Arrow keys or Enter to navigate.
            </span>
          </div>

          <div className="grid-manipulation-buttons">
            <button
              type="button"
              className="btn-add-dimension"
              onClick={() => handleAddColumn()}
              title="Add a new column to the right"
            >
              <Plus size={15} />
              <span>Add Column</span>
            </button>

            <button
              type="button"
              className="btn-add-dimension"
              onClick={() => handleAddRow()}
              title="Add a new row at the bottom"
            >
              <Plus size={15} />
              <span>Add Row</span>
            </button>
          </div>
        </div>

        {/* Scrollable Data Table Grid */}
        <div className="grid-scroll-wrapper">
          <table className="matrix-table">
            <thead>
              <tr className="header-row">
                {/* Top-Left Corner Cell with index */}
                <th className="corner-cell">
                  <div className="corner-content" title="Row \ Col Index">
                    <span className="corner-text">R \ C</span>
                  </div>
                </th>

                {/* Editable Column Headers */}
                {tableData.headers.map((headerText, colIdx) => {
                  const isInvalidHeader = errorMap.headers[colIdx];
                  const isHovered = hoveredCol === colIdx;

                  return (
                    <th
                      key={`hdr-${colIdx}`}
                      className={`column-header-cell ${isHovered ? 'col-highlight' : ''}`}
                      onMouseEnter={() => setHoveredCol(colIdx)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div className="col-header-box">
                        <div className="col-header-top">
                          <span className="col-index-tag">Col {colIdx + 1}</span>
                          <button
                            type="button"
                            className="btn-col-delete"
                            onClick={() => handleRemoveColumn(colIdx)}
                            title={`Delete Column ${colIdx + 1} (${headerText || 'Empty'})`}
                            disabled={colsCount <= 1}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <input
                          id={`header-${colIdx}`}
                          type="text"
                          className={`header-input ${isInvalidHeader ? 'is-invalid' : ''}`}
                          placeholder={`Column ${colIdx + 1} Name`}
                          value={headerText}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                        />
                        {isInvalidHeader && (
                          <div className="cell-error-indicator" title="Header name cannot be blank!">
                            <AlertCircle size={12} />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Inline Add Column Button Header */}
                <th className="action-col-header">
                  <button
                    type="button"
                    className="btn-inline-add-col"
                    onClick={() => handleAddColumn()}
                    title="Add Column"
                  >
                    <Plus size={16} />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {tableData.rows.map((row, rowIdx) => {
                const isHoveredRow = hoveredRow === rowIdx;

                return (
                  <tr
                    key={`row-${rowIdx}`}
                    className={`matrix-row ${isHoveredRow ? 'row-highlight' : ''}`}
                    onMouseEnter={() => setHoveredRow(rowIdx)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Row Header with Index & Delete Button */}
                    <td className="row-header-cell">
                      <div className="row-header-box">
                        <span className="row-number-badge">#{rowIdx + 1}</span>
                        <button
                          type="button"
                          className="btn-row-delete"
                          onClick={() => handleRemoveRow(rowIdx)}
                          title={`Delete Row ${rowIdx + 1}`}
                          disabled={rowsCount <= 1}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                    {/* 2D Array Input Cells */}
                    {tableData.headers.map((_, colIdx) => {
                      const cellValue = row[colIdx] !== undefined ? row[colIdx] : '';
                      const isInvalidCell = errorMap.cells[`${rowIdx}-${colIdx}`];
                      const isFocused = activeCell?.row === rowIdx && activeCell?.col === colIdx;
                      const isColHovered = hoveredCol === colIdx;

                      return (
                        <td
                          key={`cell-td-${rowIdx}-${colIdx}`}
                          className={`matrix-cell-td ${isColHovered ? 'col-highlight' : ''}`}
                        >
                          <div className={`cell-input-wrapper ${isInvalidCell ? 'cell-invalid' : ''} ${isFocused ? 'cell-focused' : ''}`}>
                            <input
                              id={`cell-${rowIdx}-${colIdx}`}
                              type="text"
                              className="matrix-cell-input"
                              placeholder="Enter value..."
                              value={cellValue}
                              onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                              onFocus={() => setActiveCell({ row: rowIdx, col: colIdx })}
                              onBlur={() => setActiveCell(null)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              autoComplete="off"
                            />

                            {/* Coordinate tag indicator shown on focus */}
                            <span className="cell-coords-tag">
                              [{rowIdx}][{colIdx}]
                            </span>

                            {/* Blank validation alert indicator */}
                            {isInvalidCell && (
                              <div
                                className="cell-error-indicator"
                                title={`Row ${rowIdx + 1}, Col ${colIdx + 1} cannot be blank!`}
                              >
                                <AlertCircle size={13} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Row Spacer */}
                    <td className="row-spacer-cell"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inline Add Row Button at Bottom of Grid */}
        <div className="grid-bottom-actions">
          <button
            type="button"
            className="btn-inline-add-row"
            onClick={() => handleAddRow()}
            title="Append a new row to the bottom"
          >
            <Plus size={15} />
            <span>Add Row to Matrix</span>
          </button>
        </div>
      </div>

      {/* Submit & Save Floating Footer Bar */}
      <div className="submit-footer-bar">
        <div className="submit-left">
          <div className="save-status-info">
            <span className="matrix-dim-text">
              Array: <strong>{rowsCount} × {colsCount}</strong>
            </span>
            <span className="save-hint">
              {validationErrors.length > 0 ? (
                <span className="text-warning">
                  ⚠️ {validationErrors.length} empty {validationErrors.length === 1 ? 'field' : 'fields'} must be filled before saving.
                </span>
              ) : (
                <span className="text-success">
                  ✓ Ready for database commit
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="submit-right-actions">
          {/* Save as New Record (Always appends without replacing old data) */}
          <button
            type="button"
            className="btn-save-secondary"
            onClick={() => onSave({ saveAsNew: true })}
            disabled={isSaving}
            title="Save as a new distinct dataset in database.json (preserves all previous datasets)"
          >
            <PlusCircle size={16} />
            <span>Save as New Entry</span>
          </button>

          {/* Save / Update Button */}
          <button
            type="button"
            className={`btn-save-primary ${isSaving ? 'loading' : ''}`}
            onClick={() => onSave({ saveAsNew: !isExistingRecord })}
            disabled={isSaving}
            title={isExistingRecord ? "Update current dataset in database.json" : "Save matrix to database.json"}
          >
            {isSaving ? (
              <>
                <div className="spinner" />
                <span>Saving to JSON DB...</span>
              </>
            ) : isExistingRecord ? (
              <>
                <RefreshCw size={16} />
                <span>Update Record</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Matrix (database.json)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

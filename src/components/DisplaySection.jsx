import React, { useState } from 'react';
import { 
  Table, 
  Code, 
  BarChart2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  FileJson, 
  AlignLeft,
  AlignRight,
  AlignCenter
} from 'lucide-react';

export default function DisplaySection({ tableData, onCopyToast }) {
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'json' | 'stats'
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [jsonFormat, setJsonFormat] = useState('raw-2d'); // 'raw-2d' | 'full-json' | 'csv'
  const [searchFilter, setSearchFilter] = useState('');
  const [columnAlignment, setColumnAlignment] = useState('auto'); // 'auto' | 'left' | 'right' | 'center'

  const rows = tableData.rows || [];
  const headers = tableData.headers || [];
  const rowCount = rows.length;
  const colCount = headers.length;
  const totalCells = rowCount * colCount;

  // Compute column statistics (sums, averages if numbers)
  const columnStats = React.useMemo(() => {
    return headers.map((header, colIdx) => {
      let isNumeric = true;
      let sum = 0;
      let validCount = 0;
      let min = Infinity;
      let max = -Infinity;

      for (let r = 0; r < rowCount; r++) {
        const val = rows[r]?.[colIdx];
        if (val === undefined || val === null || val.toString().trim() === '') {
          continue;
        }
        const num = parseFloat(val);
        if (isNaN(num)) {
          isNumeric = false;
          break;
        } else {
          sum += num;
          validCount++;
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }

      if (isNumeric && validCount > 0) {
        return {
          isNumeric: true,
          count: validCount,
          sum: sum,
          avg: sum / validCount,
          min: min,
          max: max
        };
      }

      return { isNumeric: false, count: validCount };
    });
  }, [rows, headers, rowCount]);

  // General matrix statistics
  const generalStats = React.useMemo(() => {
    let filledCount = 0;
    let numericCount = 0;
    let textCount = 0;

    rows.forEach(row => {
      row.forEach(val => {
        if (val !== undefined && val !== null && val.toString().trim() !== '') {
          filledCount++;
          if (!isNaN(parseFloat(val)) && isFinite(val)) {
            numericCount++;
          } else {
            textCount++;
          }
        }
      });
    });

    const fillDensity = totalCells > 0 ? ((filledCount / totalCells) * 100).toFixed(1) : '0';
    const isSquare = rowCount > 0 && rowCount === colCount;

    return {
      filledCount,
      emptyCount: totalCells - filledCount,
      fillDensity,
      numericCount,
      textCount,
      isSquare
    };
  }, [rows, totalCells, rowCount, colCount]);

  // Formatted representations
  const raw2DArray = rows.map(r => r.slice(0, colCount));
  const fullJsonPayload = {
    id: tableData.id,
    title: tableData.title,
    description: tableData.description,
    dimensions: { rows: rowCount, columns: colCount },
    headers: headers,
    matrix: raw2DArray,
    updatedAt: new Date().toISOString()
  };

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.slice(0, colCount).map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  const getActiveCodeString = () => {
    if (jsonFormat === 'raw-2d') {
      return JSON.stringify(raw2DArray, null, 2);
    }
    if (jsonFormat === 'full-json') {
      return JSON.stringify(fullJsonPayload, null, 2);
    }
    return csvContent;
  };

  const handleCopyCode = () => {
    const text = getActiveCodeString();
    navigator.clipboard.writeText(text);
    setCopiedFormat(jsonFormat);
    if (onCopyToast) onCopyToast('Copied 2D Array data to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadFile = () => {
    const isCsv = jsonFormat === 'csv';
    const content = getActiveCodeString();
    const blob = new Blob([content], { type: isCsv ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(tableData.title || 'matrix').toLowerCase().replace(/\s+/g, '_')}.${isCsv ? 'csv' : 'json'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered rows for visual display table
  const filteredRows = rows.filter(row => {
    if (!searchFilter.trim()) return true;
    return row.some(cell => 
      cell && cell.toString().toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  // Determine alignment class for a given column index
  const getColAlignClass = (colIdx) => {
    if (columnAlignment === 'left') return 'align-left';
    if (columnAlignment === 'right') return 'align-right';
    if (columnAlignment === 'center') return 'align-center';
    
    // Default 'auto': numbers right-aligned, text left-aligned
    const isNum = columnStats[colIdx]?.isNumeric;
    return isNum ? 'align-right' : 'align-left';
  };

  return (
    <section className="display-section-card">
      {/* Tab Navigation Header */}
      <div className="display-header">
        <div className="display-tabs">
          <button
            type="button"
            className={`display-tab ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <Table size={16} />
            <span>Visual Data Table</span>
          </button>

          <button
            type="button"
            className={`display-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code size={16} />
            <span>2D Array / JSON Output</span>
          </button>

          <button
            type="button"
            className={`display-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart2 size={16} />
            <span>Matrix Analytics</span>
          </button>
        </div>

        <div className="display-actions">
          {activeTab === 'table' && (
            <div className="display-table-controls">
              {/* Column Alignment Toggle */}
              <div className="alignment-toggle-wrap">
                <span className="control-label">Alignment:</span>
                <div className="btn-group-toggle">
                  <button
                    type="button"
                    className={`btn-toggle-option ${columnAlignment === 'auto' ? 'active' : ''}`}
                    onClick={() => setColumnAlignment('auto')}
                    title="Auto: Numbers Right, Text Left"
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle-option ${columnAlignment === 'left' ? 'active' : ''}`}
                    onClick={() => setColumnAlignment('left')}
                    title="Align All Left"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle-option ${columnAlignment === 'right' ? 'active' : ''}`}
                    onClick={() => setColumnAlignment('right')}
                    title="Align All Right"
                  >
                    <AlignRight size={13} />
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle-option ${columnAlignment === 'center' ? 'active' : ''}`}
                    onClick={() => setColumnAlignment('center')}
                    title="Align All Center"
                  >
                    <AlignCenter size={13} />
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter rows..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="code-format-toggles">
              <button
                type="button"
                className={`format-btn ${jsonFormat === 'raw-2d' ? 'active' : ''}`}
                onClick={() => setJsonFormat('raw-2d')}
              >
                Raw 2D Array
              </button>
              <button
                type="button"
                className={`format-btn ${jsonFormat === 'full-json' ? 'active' : ''}`}
                onClick={() => setJsonFormat('full-json')}
              >
                Full JSON Schema
              </button>
              <button
                type="button"
                className={`format-btn ${jsonFormat === 'csv' ? 'active' : ''}`}
                onClick={() => setJsonFormat('csv')}
              >
                CSV Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="display-content-body">
        {/* TAB 1: Visual Presentation Table */}
        {activeTab === 'table' && (
          <div className="presentation-table-view animate-fade-in">
            <div className="presentation-summary-header">
              <div>
                <h4 className="presentation-title">{tableData.title || 'Untitled 2D Matrix'}</h4>
                {tableData.description && (
                  <p className="presentation-desc">{tableData.description}</p>
                )}
              </div>
              <div className="presentation-meta-badges">
                <span className="badge-meta">{rowCount} Rows</span>
                <span className="badge-meta">{colCount} Columns</span>
                <span className="badge-meta">{totalCells} Data Cells</span>
              </div>
            </div>

            <div className="table-responsive-container">
              <table className="presentation-table">
                <thead>
                  <tr>
                    <th className="th-index">#</th>
                    {headers.map((hdr, i) => {
                      const alignClass = getColAlignClass(i);
                      const isNum = columnStats[i]?.isNumeric;
                      return (
                        <th key={`disp-th-${i}`} className={`th-data ${alignClass}`}>
                          <div className={`th-content ${alignClass}`}>
                            <span>{hdr || `Col ${i + 1}`}</span>
                            {isNum && (
                              <span className="numeric-indicator" title="Numeric column">123</span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr key={`disp-tr-${rIdx}`}>
                      <td className="td-index">{rIdx + 1}</td>
                      {headers.map((_, cIdx) => {
                        const val = row[cIdx];
                        const alignClass = getColAlignClass(cIdx);
                        return (
                          <td 
                            key={`disp-td-${rIdx}-${cIdx}`} 
                            className={`td-data ${alignClass}`}
                          >
                            {val !== undefined && val !== '' ? (
                              <span className="cell-value-text">{val}</span>
                            ) : (
                              <span className="empty-cell-placeholder">(blank)</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={colCount + 1} className="empty-table-state">
                        No matching rows found for query "{searchFilter}"
                      </td>
                    </tr>
                  )}
                </tbody>
                {/* Column Totals & Averages Footer if numeric */}
                {columnStats.some(s => s.isNumeric) && (
                  <tfoot>
                    <tr className="tfoot-totals">
                      <td className="td-index-foot">Σ Total</td>
                      {columnStats.map((stat, i) => {
                        const alignClass = getColAlignClass(i);
                        return (
                          <td key={`total-col-${i}`} className={`td-foot-data ${alignClass}`}>
                            {stat.isNumeric ? (
                              <strong>{stat.sum.toLocaleString()}</strong>
                            ) : (
                              <span className="text-dim">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="tfoot-avg">
                      <td className="td-index-foot">μ Average</td>
                      {columnStats.map((stat, i) => {
                        const alignClass = getColAlignClass(i);
                        return (
                          <td key={`avg-col-${i}`} className={`td-foot-data ${alignClass}`}>
                            {stat.isNumeric ? (
                              <span>{stat.avg.toFixed(2)}</span>
                            ) : (
                              <span className="text-dim">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Raw 2D Array & JSON Code */}
        {activeTab === 'json' && (
          <div className="json-code-view animate-fade-in">
            <div className="code-view-toolbar">
              <div className="code-view-info">
                <FileJson size={16} className="text-accent" />
                <span className="code-filename">
                  {jsonFormat === 'raw-2d' 
                    ? '2D_Array_Data.json (string[][])' 
                    : jsonFormat === 'full-json' 
                    ? 'database_schema.json' 
                    : 'export_data.csv'}
                </span>
              </div>
              <div className="code-view-actions">
                <button
                  type="button"
                  className="btn-code-action"
                  onClick={handleCopyCode}
                  title="Copy formatted content to clipboard"
                >
                  {copiedFormat === jsonFormat ? (
                    <>
                      <Check size={14} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-code-action"
                  onClick={handleDownloadFile}
                  title="Download as file"
                >
                  <Download size={14} />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <pre className="code-display-block">
              <code>{getActiveCodeString()}</code>
            </pre>
          </div>
        )}

        {/* TAB 3: Matrix Statistics & Analysis */}
        {activeTab === 'stats' && (
          <div className="matrix-stats-view animate-fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Matrix Dimensions</span>
                <span className="stat-value">{rowCount} × {colCount}</span>
                <span className="stat-sub">{generalStats.isSquare ? 'Square Matrix (N=M)' : 'Rectangular Matrix'}</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Total Elements</span>
                <span className="stat-value">{totalCells}</span>
                <span className="stat-sub">{generalStats.filledCount} filled · {generalStats.emptyCount} empty</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Fill Density</span>
                <span className="stat-value">{generalStats.fillDensity}%</span>
                <span className="stat-sub">{generalStats.emptyCount === 0 ? '100% Fully Populated' : 'Contains Blanks'}</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Data Types</span>
                <span className="stat-value">{generalStats.numericCount} Num / {generalStats.textCount} Text</span>
                <span className="stat-sub">Auto-detected numeric values</span>
              </div>
            </div>

            {/* Column Level Breakdown */}
            <div className="column-breakdown-card">
              <h5 className="breakdown-title">Column Properties &amp; Distributions</h5>
              <div className="column-pills-list">
                {headers.map((h, idx) => {
                  const stat = columnStats[idx];
                  return (
                    <div key={`col-pill-${idx}`} className="col-stat-pill">
                      <div className="pill-header">
                        <span className="pill-index">Col #{idx + 1}</span>
                        <strong className="pill-name">{h || `Column ${idx + 1}`}</strong>
                      </div>
                      <div className="pill-details">
                        <span className="pill-type-tag">
                          {stat.isNumeric ? 'Numeric (123)' : 'String (Abc)'}
                        </span>
                        {stat.isNumeric && (
                          <div className="pill-num-stats">
                            <span>Min: <strong>{stat.min}</strong></span>
                            <span>Max: <strong>{stat.max}</strong></span>
                            <span>Sum: <strong>{stat.sum.toLocaleString()}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Trash2, 
  FolderOpen, 
  Clock, 
  Hash, 
  Plus, 
  Search, 
  FileJson, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export default function DatabaseModal({
  isOpen,
  onClose,
  savedTables,
  currentTableId,
  onSelectTable,
  onDeleteTable,
  onNewTable,
  dbStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedTables.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog database-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Database size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="modal-title">JSON Database Collections</h3>
              <p className="modal-subtitle">
                Tables stored in <code className="code-badge">data/database.json</code>
              </p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="modal-toolbar">
          <div className="search-input-wrapper modal-search">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search saved datasets..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="button"
            className="btn-modal-action primary"
            onClick={() => {
              onNewTable();
              onClose();
            }}
          >
            <Plus size={15} />
            <span>Create New</span>
          </button>
        </div>

        {/* Datasets List */}
        <div className="modal-body-scroll">
          {filtered.length === 0 ? (
            <div className="modal-empty-state">
              <FileJson size={40} className="text-dim" />
              <p className="empty-state-title">No tables found in JSON database</p>
              <p className="empty-state-sub">
                Save your current 2D matrix or create a new one to store it in <code className="code-badge">database.json</code>.
              </p>
            </div>
          ) : (
            <div className="database-cards-list">
              {filtered.map(table => {
                const isCurrent = table.id === currentTableId;
                const rowsCount = table.rows ? table.rows.length : 0;
                const colsCount = table.headers ? table.headers.length : 0;
                const dateStr = table.updatedAt 
                  ? new Date(table.updatedAt).toLocaleString() 
                  : 'Recently saved';

                return (
                  <div 
                    key={table.id} 
                    className={`db-table-card ${isCurrent ? 'is-active' : ''}`}
                  >
                    <div className="db-card-info">
                      <div className="db-card-header">
                        <h4 className="db-table-title">{table.title}</h4>
                        {isCurrent && (
                          <span className="badge-active-table">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        )}
                      </div>

                      {table.description && (
                        <p className="db-table-desc">{table.description}</p>
                      )}

                      <div className="db-card-meta">
                        <span className="meta-pill">
                          <Hash size={12} />
                          {rowsCount} × {colsCount} Matrix ({rowsCount * colsCount} cells)
                        </span>
                        <span className="meta-pill">
                          <Clock size={12} />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="db-card-actions">
                      <button
                        type="button"
                        className="btn-db-load"
                        onClick={() => {
                          onSelectTable(table);
                          onClose();
                        }}
                      >
                        <FolderOpen size={14} />
                        <span>{isCurrent ? 'Reload' : 'Open'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-db-delete"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${table.title}" from database.json?`)) {
                            onDeleteTable(table.id);
                          }
                        }}
                        title="Delete this table"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="db-footer-status">
            <span className="dot-status" />
            <span>Persistence: <strong>JSON File Backend</strong> (<code className="code-badge">data/database.json</code>)</span>
          </div>
          <button type="button" className="btn-modal-close-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

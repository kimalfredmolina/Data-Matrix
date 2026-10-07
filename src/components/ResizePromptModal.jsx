import React, { useState } from 'react';
import { X, Grid3X3, ArrowRight, Sparkles } from 'lucide-react';

export default function ResizePromptModal({
  isOpen,
  onClose,
  currentRows,
  currentCols,
  onApplyDimensions
}) {
  const [rows, setRows] = useState(currentRows || 3);
  const [cols, setCols] = useState(currentCols || 3);
  const [fillType, setFillType] = useState('empty'); // 'empty' | 'sequential' | 'preserve'

  React.useEffect(() => {
    if (isOpen) {
      setRows(currentRows || 3);
      setCols(currentCols || 3);
      setFillType('preserve');
    }
  }, [isOpen, currentRows, currentCols]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const r = Math.max(1, Math.min(50, parseInt(rows, 10) || 1));
    const c = Math.max(1, Math.min(20, parseInt(cols, 10) || 1));
    onApplyDimensions(r, c, fillType);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog resize-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Grid3X3 size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="modal-title">Set 2D Array Dimensions</h3>
              <p className="modal-subtitle">Define the number of rows and columns for the matrix</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="dimension-inputs-grid">
            <div className="dim-input-group">
              <label htmlFor="dim-rows" className="dim-label">
                Number of Rows (M)
              </label>
              <div className="number-input-wrap">
                <input
                  id="dim-rows"
                  type="number"
                  min="1"
                  max="50"
                  className="dim-number-input"
                  value={rows}
                  onChange={e => setRows(e.target.value)}
                  required
                />
                <span className="dim-unit">Rows (1-50)</span>
              </div>
            </div>

            <div className="dim-times-symbol">×</div>

            <div className="dim-input-group">
              <label htmlFor="dim-cols" className="dim-label">
                Number of Columns (N)
              </label>
              <div className="number-input-wrap">
                <input
                  id="dim-cols"
                  type="number"
                  min="1"
                  max="20"
                  className="dim-number-input"
                  value={cols}
                  onChange={e => setCols(e.target.value)}
                  required
                />
                <span className="dim-unit">Cols (1-20)</span>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="quick-dim-presets">
            <span className="quick-dim-label">Quick Sizes:</span>
            {[
              [2, 2],
              [3, 3],
              [4, 4],
              [5, 5],
              [4, 6],
              [10, 5]
            ].map(([r, c]) => (
              <button
                key={`${r}x${c}`}
                type="button"
                className={`btn-quick-dim ${rows == r && cols == c ? 'active' : ''}`}
                onClick={() => {
                  setRows(r);
                  setCols(c);
                }}
              >
                {r} × {c}
              </button>
            ))}
          </div>

          {/* Fill behavior radio options */}
          <div className="fill-options-section">
            <label className="dim-label">Data Fill Option:</label>
            <div className="fill-radio-group">
              <label className={`radio-card ${fillType === 'preserve' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fillType"
                  value="preserve"
                  checked={fillType === 'preserve'}
                  onChange={e => setFillType(e.target.value)}
                />
                <div>
                  <strong className="radio-title">Preserve Existing Data</strong>
                  <p className="radio-sub">Keep existing cell values where possible, trim or expand with empty cells</p>
                </div>
              </label>

              <label className={`radio-card ${fillType === 'sequential' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fillType"
                  value="sequential"
                  checked={fillType === 'sequential'}
                  onChange={e => setFillType(e.target.value)}
                />
                <div>
                  <strong className="radio-title">Fill with Sample Sequence</strong>
                  <p className="radio-sub">Generate sequential numbers (10, 20, 30...) to populate all cells</p>
                </div>
              </label>

              <label className={`radio-card ${fillType === 'empty' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fillType"
                  value="empty"
                  checked={fillType === 'empty'}
                  onChange={e => setFillType(e.target.value)}
                />
                <div>
                  <strong className="radio-title">Clear &amp; Start Blank</strong>
                  <p className="radio-sub">Initialize clean empty matrix</p>
                </div>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              <span>Apply {rows} × {cols} Grid</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

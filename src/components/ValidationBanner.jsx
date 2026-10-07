import React from 'react';
import { AlertTriangle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function ValidationBanner({
  validationErrors,
  onFocusField,
  onFillSampleData
}) {
  if (!validationErrors || validationErrors.length === 0) {
    return (
      <div className="validation-banner success animate-fade-in">
        <div className="validation-content">
          <div className="validation-badge success">
            <span>✓ Complete</span>
          </div>
          <span className="validation-message-text">
            All fields and headers are fully populated. Ready to Save/Submit!
          </span>
        </div>
      </div>
    );
  }

  const headerErrors = validationErrors.filter(e => e.type === 'header');
  const cellErrors = validationErrors.filter(e => e.type === 'cell');
  const titleError = validationErrors.find(e => e.type === 'title');

  return (
    <div className="validation-banner error animate-slide-down" role="alert">
      <div className="validation-header">
        <div className="validation-title-wrap">
          <AlertTriangle className="error-icon" size={20} />
          <div>
            <h4 className="validation-title">
              Validation Notice: No blank fields allowed
            </h4>
            <p className="validation-subtitle">
              Found <strong>{validationErrors.length}</strong> empty {validationErrors.length === 1 ? 'field' : 'fields'} that must be completed before saving.
            </p>
          </div>
        </div>

        {onFillSampleData && (
          <button 
            type="button"
            className="btn-quick-fill"
            onClick={onFillSampleData}
            title="Auto-fill empty fields with sample values"
          >
            <Sparkles size={14} />
            <span>Auto-fill Blanks</span>
          </button>
        )}
      </div>

      <div className="validation-chips-container">
        {titleError && (
          <button
            type="button"
            className="error-chip"
            onClick={() => onFocusField('title')}
          >
            <AlertCircle size={12} />
            <span>Dataset Title is empty</span>
            <ArrowRight size={10} />
          </button>
        )}

        {headerErrors.map((err, i) => (
          <button
            key={`hdr-${err.colIndex}-${i}`}
            type="button"
            className="error-chip"
            onClick={() => onFocusField(`header-${err.colIndex}`)}
          >
            <AlertCircle size={12} />
            <span>Header Col {err.colIndex + 1} is empty</span>
            <ArrowRight size={10} />
          </button>
        ))}

        {cellErrors.slice(0, 8).map((err, i) => (
          <button
            key={`cell-${err.rowIndex}-${err.colIndex}-${i}`}
            type="button"
            className="error-chip"
            onClick={() => onFocusField(`cell-${err.rowIndex}-${err.colIndex}`)}
          >
            <AlertCircle size={12} />
            <span>
              Row {err.rowIndex + 1}, Col {err.colIndex + 1} ({err.colName || 'Field'})
            </span>
            <ArrowRight size={10} />
          </button>
        ))}

        {cellErrors.length > 8 && (
          <span className="error-chip-more">
            +{cellErrors.length - 8} more empty cells...
          </span>
        )}
      </div>
    </div>
  );
}

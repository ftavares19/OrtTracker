import { useState } from 'react';
import type { Subject, SubjectStatus } from '../models/types';
import './SubjectItem.css';

interface SubjectItemProps {
  subject: Subject;
  onUpdateStatus: (subjectId: number, status: SubjectStatus) => Promise<void>;
  onShowDetails: (subjectId: number) => void;
}

export default function SubjectItem({ subject, onUpdateStatus, onShowDetails }: SubjectItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (e: React.MouseEvent, status: SubjectStatus) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(subject.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusClass = () => {
    if (subject.status === 'Approved') return 'approved';
    if (subject.status === 'PartiallyApproved') return 'in-progress';
    if (subject.isEligible) return 'eligible';
    return 'locked';
  };

  const getStatusLabel = () => {
    if (subject.status === 'Approved') return 'Aprobada';
    if (subject.status === 'PartiallyApproved') return 'Cursada';
    if (subject.isEligible) return 'Habilitada';
    return 'No habilitada';
  };

  const getStatusIcon = () => {
    if (subject.status === 'Approved') return '✓';
    if (subject.status === 'PartiallyApproved') return '◐';
    if (subject.isEligible) return '○';
    return '✕';
  };

  const canShowDetails = subject.status === 'NotTaken' && !subject.isEligible;

  return (
    <div 
      className={`subject-item ${getStatusClass()}`}
      onClick={() => canShowDetails && onShowDetails(subject.id)}
      style={{ cursor: canShowDetails ? 'pointer' : 'default' }}
    >
      <div className="subject-header">
        <span className={`status-icon ${getStatusClass()}`}>
          {getStatusIcon()}
        </span>
        <span className={`status-label ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
      </div>

      <div className="subject-info">
        <h3 className="subject-name">{subject.name}</h3>
        {canShowDetails && (
          <p className="subject-hint">Click para ver requisitos</p>
        )}
      </div>

      {subject.isEligible && subject.status === 'NotTaken' && (
        <div className="subject-actions">
          <button
            className="btn-action btn-partial"
            onClick={(e) => handleStatusUpdate(e, 'PartiallyApproved')}
            disabled={isUpdating}
          >
            Marcar cursada
          </button>
          <button
            className="btn-action btn-approve"
            onClick={(e) => handleStatusUpdate(e, 'Approved')}
            disabled={isUpdating}
          >
            Marcar aprobada
          </button>
        </div>
      )}

      {subject.status === 'PartiallyApproved' && (
        <div className="subject-actions">
          <button
            className="btn-action btn-approve"
            onClick={(e) => handleStatusUpdate(e, 'Approved')}
            disabled={isUpdating}
          >
            Marcar aprobada
          </button>
          <button
            className="btn-action btn-reset"
            onClick={(e) => handleStatusUpdate(e, 'NotTaken')}
            disabled={isUpdating}
          >
            Deshacer
          </button>
        </div>
      )}

      {subject.status === 'Approved' && (
        <div className="subject-actions">
          <button
            className="btn-action btn-reset"
            onClick={(e) => handleStatusUpdate(e, 'PartiallyApproved')}
            disabled={isUpdating}
          >
            Volver a cursada
          </button>
        </div>
      )}
    </div>
  );
}

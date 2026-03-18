import { useEffect, useState } from 'react';
import type { SubjectDetail } from '../models/types';
import { subjectService } from '../services/api';
import { parseRequirement, getRequirementIcon, getRequirementCssClass } from '../utils/requirementParser';
import './SubjectDetailModal.css';

interface SubjectDetailModalProps {
  subjectId: number;
  onClose: () => void;
}

export default function SubjectDetailModal({ subjectId, onClose }: SubjectDetailModalProps) {
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subjectService.getSubjectDetail(subjectId);
        setSubject(data);
      } catch (err) {
        setError('Error al cargar los detalles de la materia');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Requisitos de la materia</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading && (
          <div className="modal-body">
            <p className="loading-text">Cargando...</p>
          </div>
        )}

        {error && (
          <div className="modal-body">
            <p className="error-text">{error}</p>
          </div>
        )}

        {subject && !loading && (
          <div className="modal-body">
            <div className="subject-detail-header">
              <h3 className="subject-name-large">{subject.name}</h3>
              <div className="subject-meta-large">
                <span className="semester-badge">Semestre {subject.semester}</span>
                <span className={`status-badge status-${subject.status.toLowerCase()}`}>
                  {subject.status === 'NotTaken' && 'No cursada'}
                  {subject.status === 'PartiallyApproved' && 'Cursada'}
                  {subject.status === 'Approved' && 'Aprobada'}
                </span>
              </div>
            </div>

            {subject.missingRequirements.length > 0 ? (
              <div className="requirements-section">
                <h4>¿Qué necesitas para cursarla?</h4>
                <div className="requirements-list-enhanced">
                  {subject.missingRequirements.map((req, index) => {
                    const parsed = parseRequirement(req);
                    return (
                      <div 
                        key={index} 
                        className={`requirement-item-enhanced ${getRequirementCssClass(parsed.type)}`}
                      >
                        <span className="req-icon">{getRequirementIcon(parsed.type)}</span>
                        <div className="req-content">
                          <span className="req-message">{parsed.message}</span>
                          {parsed.type === 'partial' && (
                            <span className="req-badge req-badge-partial">Crédito Parcial</span>
                          )}
                          {parsed.type === 'total' && (
                            <span className="req-badge req-badge-total">Crédito Total</span>
                          )}
                          {parsed.type === 'count' && (
                            <span className="req-badge req-badge-count">Cantidad Mínima</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="requirement-legend">
                  <p className="legend-title">Tipos de crédito:</p>
                  <ul className="legend-list">
                    <li>
                      <span className="legend-icon">📝</span>
                      <strong>Crédito Parcial:</strong> Solo necesitas cursar la materia
                    </li>
                    <li>
                      <span className="legend-icon">✅</span>
                      <strong>Crédito Total:</strong> Necesitas aprobar el examen final
                    </li>
                    <li>
                      <span className="legend-icon">🔢</span>
                      <strong>Cantidad Mínima:</strong> Necesitas X materias aprobadas en total
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-requirements">
                <p className="eligible-message">✓ Esta materia está habilitada para cursar</p>
                <p className="eligible-detail">Cumples con todos los requisitos necesarios</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

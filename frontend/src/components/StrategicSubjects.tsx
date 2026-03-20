import { useState } from 'react';
import type { StrategicSubject } from '../models/types';
import './StrategicSubjects.css';

interface StrategicSubjectsProps {
  strategicSubjects: StrategicSubject[];
}

export default function StrategicSubjects({ strategicSubjects }: StrategicSubjectsProps) {
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

  if (strategicSubjects.length === 0) {
    return null;
  }

  const toggleExpand = (subjectId: number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const getActionText = (action: string): string => {
    return action === 'Complete' ? 'Cursar' : 'Aprobar';
  };

  return (
    <div className="strategic-subjects">
      <div className="strategic-header">
        <h2>Materias estratégicas para cursar ahora</h2>
        <p className="strategic-subtitle">
          Estas materias tienen impacto en tu progreso. Priorizarlas te ayudará a avanzar más eficientemente.
        </p>
      </div>

      <div className="strategic-list">
        {strategicSubjects.map((strategic) => (
          <div key={strategic.subjectId} className="strategic-card">
            <div className="strategic-card-header" onClick={() => toggleExpand(strategic.subjectId)}>
              <div className="strategic-info">
                <h3 className="strategic-name">
                  {strategic.subjectName} <span className="semester-badge">(Semestre {strategic.semester})</span>
                </h3>
                <div className="strategic-metrics">
                  <span className="metric-item action-required">
                    Acción: {getActionText(strategic.requiredAction)}
                  </span>
                  
                  {strategic.directUnlocks.count > 0 && (
                    <span className="metric-item direct-impact">
                      Destraba {strategic.directUnlocks.count} {strategic.directUnlocks.count === 1 ? 'materia' : 'materias'}
                    </span>
                  )}
                  
                  {strategic.futureDependents.count > 0 && (
                    <span className="metric-item future-dependency">
                      Previa de {strategic.futureDependents.count} {strategic.futureDependents.count === 1 ? 'materia' : 'materias'}
                    </span>
                  )}
                </div>
              </div>
              <button className="expand-button" aria-label="Ver detalles">
                {expandedSubject === strategic.subjectId ? '−' : '+'}
              </button>
            </div>

            {expandedSubject === strategic.subjectId && (
              <div className="strategic-card-details">
                {strategic.directUnlocks.count > 0 && (
                  <div className="details-section">
                    <p className="details-title">
                      Si completas esta materia, destrabas:
                    </p>
                    <ul className="details-list details-list-relations">
                      {strategic.directUnlocks.subjects.map((subject, index) => (
                        <li key={index} className="relation-row relation-row-unlock">
                          <span className="relation-tag relation-tag-unlock">Desbloquea →</span>
                          <span className="relation-subject">
                            {subject.name} <span className="subject-semester">· Semestre {subject.semester}</span>
                          </span>
                          <span className="info-tip" tabIndex={0} aria-label="Ayuda sobre desbloqueo">
                            ⓘ
                            <span className="info-tip-content">
                              Si aprobás esta materia, desbloqueás directamente la siguiente.
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategic.futureDependents.count > 0 && (
                  <div className="details-section">
                    <p className="details-title">
                      Esta materia es previa de:
                    </p>
                    <ul className="details-list details-list-relations future">
                      {strategic.futureDependents.subjects.map((subject, index) => (
                        <li key={index} className="relation-row relation-row-prereq">
                          <span className="relation-tag relation-tag-prereq">Previa de →</span>
                          <span className="relation-subject">
                            {subject.name} <span className="subject-semester">· Semestre {subject.semester}</span>
                          </span>
                          <span className="info-tip" tabIndex={0} aria-label="Ayuda sobre previa">
                            ⓘ
                            <span className="info-tip-content">
                              Si aprobás esta materia, aún no desbloqueás la siguiente — necesitás cumplir otras previas también.
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

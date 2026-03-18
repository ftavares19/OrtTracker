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
                    <ul className="details-list">
                      {strategic.directUnlocks.subjects.map((subject, index) => (
                        <li key={index}>
                          {subject.name} <span className="subject-semester">· Semestre {subject.semester}</span>
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
                    <ul className="details-list future">
                      {strategic.futureDependents.subjects.map((subject, index) => (
                        <li key={index}>
                          {subject.name} <span className="subject-semester">· Semestre {subject.semester}</span>
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

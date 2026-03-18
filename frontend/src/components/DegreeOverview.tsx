import type { Degree } from '../models/types';
import './DegreeOverview.css';

interface DegreeOverviewProps {
  degree: Degree;
}

export default function DegreeOverview({ degree }: DegreeOverviewProps) {
  const progressPercentage = degree.totalSubjects > 0 
    ? Math.round((degree.approvedSubjects / degree.totalSubjects) * 100)
    : 0;

  return (
    <div className="degree-overview">
      <div className="degree-header">
        <h1>{degree.name}</h1>
      </div>
      
      <div className="degree-stats">
        <div className="stat-card">
          <span className="stat-label">Progreso</span>
          <span className="stat-value">{progressPercentage}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Materias aprobadas</span>
          <span className="stat-value">{degree.approvedSubjects} / {degree.totalSubjects}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Materias restantes</span>
          <span className="stat-value">{degree.totalSubjects - degree.approvedSubjects}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

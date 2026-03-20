import type { Subject, SubjectStatus } from '../models/types';
import SubjectItem from './SubjectItem';
import './SubjectList.css';

interface SubjectListProps {
  subjects: Subject[];
  onUpdateStatus: (subjectId: number, status: SubjectStatus) => Promise<void>;
  onShowDetails: (subjectId: number) => void;
}

export default function SubjectList({ subjects, onUpdateStatus, onShowDetails }: SubjectListProps) {
  const groupedBySemester = subjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) {
      acc[subject.semester] = [];
    }
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  const semesters = Object.keys(groupedBySemester).map(Number).sort((a, b) => a - b);

  return (
    <div className="subject-list">
      {semesters.map(semester => {
        const semesterSubjects = groupedBySemester[semester];
        
        return (
          <section key={semester} className="semester-section">
            <div className="semester-header">
              <span className="semester-title">Sem {semester}</span>
              <span className="semester-count">{semesterSubjects.length}</span>
            </div>
            <div className="subject-grid">
              {semesterSubjects.map(subject => (
                <SubjectItem
                  key={subject.id}
                  subject={subject}
                  onUpdateStatus={onUpdateStatus}
                  onShowDetails={onShowDetails}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

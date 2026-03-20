import type { Subject, SubjectStatus } from '../models/types';
import SubjectItem from './SubjectItem';
import './SubjectList.css';

interface SubjectListProps {
  subjects: Subject[];
  onUpdateStatus: (subjectId: number, status: SubjectStatus) => Promise<void>;
  onShowDetails: (subjectId: number) => void;
}

export default function SubjectList({ subjects, onUpdateStatus, onShowDetails }: SubjectListProps) {
  const workshopNames = [
    'comunicacion y liderazgo',
    'taller de innovacion y emprendedurismo'
  ];

  const normalizeText = (value: string): string => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const electiveSubjects = subjects.filter((subject) => /^electiva\b/i.test(subject.name));
  const workshopSubjects = subjects.filter((subject) => {
    const normalized = normalizeText(subject.name);
    return workshopNames.includes(normalized);
  });
  const regularSubjects = subjects.filter((subject) => {
    const normalized = normalizeText(subject.name);
    return !/^electiva\b/i.test(subject.name) && !workshopNames.includes(normalized);
  });

  const groupedBySemester = regularSubjects.reduce((acc, subject) => {
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

      {workshopSubjects.length > 0 && (
        <section className="semester-section workshops-section">
          <div className="semester-header workshops-header">
            <span className="semester-title workshops-title">
              TALLERES <span className="workshops-subtitle">· se dan en recesos</span>
            </span>
            <span className="semester-count">{workshopSubjects.length}</span>
          </div>

          <p className="workshops-context">
            Estos talleres se cursan durante los recesos entre semestres, no dentro de un semestre regular.
          </p>

          <div className="subject-grid">
            {workshopSubjects.map(subject => (
              <SubjectItem
                key={subject.id}
                subject={subject}
                onUpdateStatus={onUpdateStatus}
                onShowDetails={onShowDetails}
              />
            ))}
          </div>
        </section>
      )}

      {electiveSubjects.length > 0 && (
        <section className="semester-section elective-section">
          <div className="semester-header elective-header">
            <span className="semester-title elective-title">
              ELECTIVAS <span className="elective-subtitle">· elegís vos</span>
            </span>
            <span className="semester-count">{electiveSubjects.length}</span>
          </div>

          <p className="elective-context">
            Las electivas son a libre elección y pueden variar según cada semestre.
          </p>

          <div className="subject-grid">
            {electiveSubjects.map(subject => (
              <SubjectItem
                key={subject.id}
                subject={subject}
                onUpdateStatus={onUpdateStatus}
                onShowDetails={onShowDetails}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

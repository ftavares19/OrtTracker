import { useEffect, useState } from 'react';
import type { Degree, Subject, SubjectStatus, StrategicSubject } from './models/types';
import { degreeService, subjectService } from './services/api';
import DegreeOverview from './components/DegreeOverview';
import StrategicSubjects from './components/StrategicSubjects';
import SubjectList from './components/SubjectList';
import SubjectDetailModal from './components/SubjectDetailModal';
import './App.css';

const DEGREE_ID = 1;

function App() {
  const [degree, setDegree] = useState<Degree | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [strategicSubjects, setStrategicSubjects] = useState<StrategicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [degreeData, subjectsData, strategicData] = await Promise.all([
        degreeService.getDegree(DEGREE_ID),
        degreeService.getSubjects(DEGREE_ID),
        degreeService.getStrategicSubjects(DEGREE_ID)
      ]);
      setDegree(degreeData);
      setSubjects(subjectsData);
      setStrategicSubjects(strategicData);
    } catch (err) {
      setError('Error al cargar los datos. Asegúrate de que la API esté corriendo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (subjectId: number, status: SubjectStatus) => {
    try {
      await subjectService.updateSubjectStatus(subjectId, status);
      await fetchData();
    } catch (err) {
      alert('Error al actualizar la materia');
      console.error(err);
    }
  };

  const handleShowDetails = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
  };

  const handleCloseModal = () => {
    setSelectedSubjectId(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !degree) {
    return (
      <div className="app">
        <div className="container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error || 'No se pudo cargar la información'}</p>
            <button className="btn-retry" onClick={fetchData}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <DegreeOverview degree={degree} />
        <StrategicSubjects strategicSubjects={strategicSubjects} />
        <SubjectList
          subjects={subjects}
          onUpdateStatus={handleUpdateStatus}
          onShowDetails={handleShowDetails}
        />
      </div>

      {selectedSubjectId !== null && (
        <SubjectDetailModal
          subjectId={selectedSubjectId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;

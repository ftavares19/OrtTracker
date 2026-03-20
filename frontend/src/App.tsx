import { useEffect, useState } from 'react';
import type { Degree, Subject, SubjectStatus, StrategicSubject } from './models/types';
import { degreeService, subjectService } from './services/api';
import DegreeOverview from './components/DegreeOverview';
import StrategicSubjects from './components/StrategicSubjects';
import SubjectList from './components/SubjectList';
import SubjectDetailModal from './components/SubjectDetailModal';
import './App.css';

const DEGREE_ID = 1;
type Theme = 'light' | 'dark';

function App() {
  const [degree, setDegree] = useState<Degree | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [strategicSubjects, setStrategicSubjects] = useState<StrategicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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
      setError('Error al cargar los datos locales de la aplicación.');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    const initialTheme: Theme = saved === 'dark' || saved === 'light'
      ? saved
      : (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleUpdateStatus = async (subjectId: number, status: SubjectStatus) => {
    try {
      await subjectService.updateSubjectStatus(subjectId, status);
      await fetchData(false);
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
        <header className="app-navbar">
          <div className="brand">ORT Tracker</div>
        </header>
        <div className="container loading-container">
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
        <header className="app-navbar">
          <div className="brand">ORT Tracker</div>
        </header>
        <div className="container loading-container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error || 'No se pudo cargar la información'}</p>
            <button className="btn-retry" onClick={() => fetchData()}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-navbar">
        <div className="brand-wrap">
          <span className="brand">ORT Tracker</span>
          <span className="brand-tagline">Tus materias, tu semestre, en un click.</span>
        </div>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2.5v2.6M12 18.9v2.6M4.8 4.8l1.9 1.9M17.3 17.3l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.8 19.2l1.9-1.9M17.3 6.7l1.9-1.9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 13.2A8.8 8.8 0 1 1 10.8 3a7.2 7.2 0 1 0 10.2 10.2z" />
            </svg>
          )}
          <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>
      </header>

      <div className="container">
        <section className="hero">
          <h1 className="hero-title">ORT Tracker</h1>
          <p className="hero-subtitle">Tus materias, tu semestre, en un click.</p>
        </section>

        <section className="degree-chips" aria-label="Carreras">
          <button className="degree-chip active" type="button">
            {degree.name}
          </button>
        </section>

        <div className="content-layout">
          <aside className="subjects-panel">
            <div className="panel-header">
              <h2>Materias</h2>
              <p>{subjects.length} en total</p>
            </div>
            <SubjectList
              subjects={subjects}
              onUpdateStatus={handleUpdateStatus}
              onShowDetails={handleShowDetails}
            />
          </aside>

          <section className="insights-panel">
            <DegreeOverview degree={degree} />
            <StrategicSubjects strategicSubjects={strategicSubjects} />
          </section>
        </div>
      </div>

      <footer>
        <span>
          Hecho por <strong>Federico Tavares</strong>
        </span>
        <a href="https://github.com/ftavares19/DegreeTracker" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Ver en GitHub
        </a>
      </footer>

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

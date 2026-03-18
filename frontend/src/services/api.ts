import curriculumData from '../data/curriculum.json';
import type { Degree, Subject, SubjectDetail, SubjectStatus, StrategicSubject } from '../models/types';

type CreditType = 'Partial' | 'Total';
type RequirementDef =
  | { type: 'subject'; subjectName: string; creditType: CreditType }
  | { type: 'approvedCount'; count: number };

interface CurriculumSubject {
  name: string;
  semester: number;
  requirements: RequirementDef[];
}

interface Curriculum {
  degreeName: string;
  subjects: CurriculumSubject[];
}

interface InternalSubject extends Subject {
  requirements: RequirementDef[];
}

const DEGREE_ID = 1;
const STORAGE_KEY = 'degree-tracker.subject-status.v1';

const curriculum = curriculumData as Curriculum;

function getStatusRank(status: SubjectStatus): number {
  switch (status) {
    case 'NotTaken':
      return 0;
    case 'PartiallyApproved':
      return 1;
    case 'Approved':
      return 2;
    default:
      return 0;
  }
}

function getDefaultStatusMap(): Record<number, SubjectStatus> {
  const map: Record<number, SubjectStatus> = {};
  curriculum.subjects.forEach((_, index) => {
    map[index + 1] = 'NotTaken';
  });
  return map;
}

function loadStatusMap(): Record<number, SubjectStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultStatusMap();
    }

    const parsed = JSON.parse(raw) as Record<string, SubjectStatus>;
    const validStatuses: SubjectStatus[] = ['NotTaken', 'PartiallyApproved', 'Approved'];
    const merged = getDefaultStatusMap();

    for (const [key, value] of Object.entries(parsed)) {
      const id = Number(key);
      if (!Number.isNaN(id) && validStatuses.includes(value)) {
        merged[id] = value;
      }
    }

    return merged;
  } catch {
    return getDefaultStatusMap();
  }
}

function saveStatusMap(statusMap: Record<number, SubjectStatus>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
}

function isRequirementSatisfied(requirement: RequirementDef, subjects: InternalSubject[]): boolean {
  if (requirement.type === 'approvedCount') {
    const approvedCount = subjects.filter(s => s.status === 'Approved').length;
    return approvedCount >= requirement.count;
  }

  const requiredSubject = subjects.find(s => s.name === requirement.subjectName);
  if (!requiredSubject) {
    return false;
  }

  if (requirement.creditType === 'Partial') {
    return getStatusRank(requiredSubject.status) >= getStatusRank('PartiallyApproved');
  }

  return requiredSubject.status === 'Approved';
}

function isSubjectEligible(subject: InternalSubject, allSubjects: InternalSubject[]): boolean {
  if (subject.status === 'Approved') {
    return false;
  }

  return subject.requirements.every(req => isRequirementSatisfied(req, allSubjects));
}

function getMissingRequirements(subject: InternalSubject, allSubjects: InternalSubject[]): string[] {
  if (subject.status === 'Approved') {
    return ['Materia ya aprobada'];
  }

  const missing: string[] = [];

  subject.requirements.forEach(req => {
    if (isRequirementSatisfied(req, allSubjects)) {
      return;
    }

    if (req.type === 'approvedCount') {
      const approvedCount = allSubjects.filter(s => s.status === 'Approved').length;
      const missingCount = req.count - approvedCount;
      missing.push(`Faltan ${missingCount} materias aprobadas (tienes ${approvedCount}/${req.count})`);
      return;
    }

    const requiredSubject = allSubjects.find(s => s.name === req.subjectName);
    if (!requiredSubject) {
      missing.push(`Materia '${req.subjectName}' no encontrada en el plan`);
      return;
    }

    if (req.creditType === 'Partial' && requiredSubject.status === 'NotTaken') {
      missing.push(`Falta cursar: ${req.subjectName}`);
      return;
    }

    if (req.creditType === 'Total') {
      if (requiredSubject.status === 'NotTaken') {
        missing.push(`Falta aprobar: ${req.subjectName} (no cursada)`);
      } else if (requiredSubject.status === 'PartiallyApproved') {
        missing.push(`Falta aprobar: ${req.subjectName} (cursada pero no aprobada)`);
      }
    }
  });

  return missing.length > 0 ? missing : ['No hay requisitos pendientes'];
}

function toInternalSubjects(statusMap: Record<number, SubjectStatus>): InternalSubject[] {
  const baseSubjects: InternalSubject[] = curriculum.subjects.map((subject, index) => ({
    id: index + 1,
    name: subject.name,
    semester: subject.semester,
    status: statusMap[index + 1] ?? 'NotTaken',
    isEligible: false,
    requirements: subject.requirements
  }));

  return baseSubjects.map(subject => ({
    ...subject,
    isEligible: isSubjectEligible(subject, baseSubjects)
  }));
}

function getCurrentSubjects(): InternalSubject[] {
  const statusMap = loadStatusMap();
  return toInternalSubjects(statusMap);
}

function toPublicSubject(subject: InternalSubject): Subject {
  return {
    id: subject.id,
    name: subject.name,
    semester: subject.semester,
    status: subject.status,
    isEligible: subject.isEligible
  };
}

function getSimulatedSubjects(subjects: InternalSubject[], subjectId: number, status: SubjectStatus): InternalSubject[] {
  return subjects.map(subject =>
    subject.id === subjectId
      ? {
          ...subject,
          status
        }
      : { ...subject }
  );
}

function wouldUnlockSubjectWithAction(
  eligibleSubject: InternalSubject,
  blockedSubject: InternalSubject,
  subjects: InternalSubject[]
): { unlocks: boolean; requiredAction: 'Complete' | 'Approve' } {
  const hasRelation = blockedSubject.requirements.some(
    req => req.type === 'subject' && req.subjectName === eligibleSubject.name
  );

  if (!hasRelation) {
    return { unlocks: false, requiredAction: 'Complete' };
  }

  const simulatedPartial = getSimulatedSubjects(subjects, eligibleSubject.id, 'PartiallyApproved');
  if (blockedSubject.requirements.every(req => isRequirementSatisfied(req, simulatedPartial))) {
    return { unlocks: true, requiredAction: 'Complete' };
  }

  const simulatedApproved = getSimulatedSubjects(subjects, eligibleSubject.id, 'Approved');
  if (blockedSubject.requirements.every(req => isRequirementSatisfied(req, simulatedApproved))) {
    return { unlocks: true, requiredAction: 'Approve' };
  }

  return { unlocks: false, requiredAction: 'Complete' };
}

function getStrategicSubjects(subjects: InternalSubject[]): StrategicSubject[] {
  const eligible = subjects.filter(subject => subject.isEligible);
  const eligibleIds = new Set(eligible.map(subject => subject.id));
  const blocked = subjects.filter(subject => subject.status !== 'Approved' && !eligibleIds.has(subject.id));

  const analyses: StrategicSubject[] = eligible
    .map(subject => {
      const directUnlocks: { name: string; semester: number }[] = [];
      const futureDependents: { name: string; semester: number }[] = [];
      let requiredAction: 'Complete' | 'Approve' = 'Complete';

      blocked.forEach(blockedSubject => {
        const isDirectPrerequisite = blockedSubject.requirements.some(
          req => req.type === 'subject' && req.subjectName === subject.name
        );

        if (!isDirectPrerequisite) {
          return;
        }

        const result = wouldUnlockSubjectWithAction(subject, blockedSubject, subjects);
        if (result.unlocks) {
          directUnlocks.push({ name: blockedSubject.name, semester: blockedSubject.semester });
          if (result.requiredAction === 'Approve') {
            requiredAction = 'Approve';
          }
        } else {
          futureDependents.push({ name: blockedSubject.name, semester: blockedSubject.semester });
        }
      });

      directUnlocks.sort((a, b) => a.name.localeCompare(b.name));
      futureDependents.sort((a, b) => a.name.localeCompare(b.name));

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        semester: subject.semester,
        requiredAction,
        directUnlocks: {
          count: directUnlocks.length,
          subjects: directUnlocks
        },
        futureDependents: {
          count: futureDependents.length,
          subjects: futureDependents
        }
      } as StrategicSubject;
    })
    .filter(analysis => analysis.directUnlocks.count > 0 || analysis.futureDependents.count > 0)
    .sort((a, b) => {
      if (b.directUnlocks.count !== a.directUnlocks.count) {
        return b.directUnlocks.count - a.directUnlocks.count;
      }
      return b.futureDependents.count - a.futureDependents.count;
    });

  return analyses;
}

export const degreeService = {
  async getDegree(degreeId: number): Promise<Degree> {
    if (degreeId !== DEGREE_ID) {
      throw new Error('Degree not found');
    }

    const subjects = getCurrentSubjects();
    return {
      id: DEGREE_ID,
      name: curriculum.degreeName,
      totalSubjects: subjects.length,
      approvedSubjects: subjects.filter(subject => subject.status === 'Approved').length
    };
  },

  async getSubjects(degreeId: number): Promise<Subject[]> {
    if (degreeId !== DEGREE_ID) {
      throw new Error('Degree not found');
    }

    const subjects = getCurrentSubjects();
    return subjects.map(toPublicSubject);
  },

  async getEligibleSubjects(degreeId: number): Promise<Subject[]> {
    if (degreeId !== DEGREE_ID) {
      throw new Error('Degree not found');
    }

    const subjects = getCurrentSubjects();
    return subjects
      .filter(subject => subject.isEligible)
      .map(toPublicSubject);
  },

  async getStrategicSubjects(degreeId: number): Promise<StrategicSubject[]> {
    if (degreeId !== DEGREE_ID) {
      throw new Error('Degree not found');
    }

    return getStrategicSubjects(getCurrentSubjects());
  }
};

export const subjectService = {
  async getSubjectDetail(subjectId: number): Promise<SubjectDetail> {
    const subjects = getCurrentSubjects();
    const subject = subjects.find(item => item.id === subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }

    return {
      id: subject.id,
      name: subject.name,
      semester: subject.semester,
      status: subject.status,
      isEligible: subject.isEligible,
      missingRequirements: getMissingRequirements(subject, subjects)
    };
  },

  async updateSubjectStatus(subjectId: number, status: SubjectStatus): Promise<void> {
    const statusMap = loadStatusMap();
    if (!(subjectId in statusMap)) {
      throw new Error('Subject not found');
    }

    statusMap[subjectId] = status;
    saveStatusMap(statusMap);
  }
};

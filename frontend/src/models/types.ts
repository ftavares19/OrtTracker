export type SubjectStatus = 'NotTaken' | 'PartiallyApproved' | 'Approved';

export interface Degree {
  id: number;
  name: string;
  totalSubjects: number;
  approvedSubjects: number;
}

export interface Subject {
  id: number;
  name: string;
  semester: number;
  status: SubjectStatus;
  isEligible: boolean;
}

export interface SubjectDetail extends Subject {
  missingRequirements: string[];
}

export type RequiredAction = 'Complete' | 'Approve';

export interface ImpactDetail {
  count: number;
  subjects: RelatedSubject[];
}

export interface RelatedSubject {
  name: string;
  semester: number;
}

export interface StrategicSubject {
  subjectId: number;
  subjectName: string;
  semester: number;
  requiredAction: RequiredAction;
  directUnlocks: ImpactDetail;
  futureDependents: ImpactDetail;
}

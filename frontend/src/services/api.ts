import type { Degree, Subject, SubjectDetail, SubjectStatus, StrategicSubject } from '../models/types';

const API_BASE_URL = 'http://localhost:5055/api';

export const degreeService = {
  async getDegree(degreeId: number): Promise<Degree> {
    const response = await fetch(`${API_BASE_URL}/degrees/${degreeId}`);
    if (!response.ok) throw new Error('Failed to fetch degree');
    return response.json();
  },

  async getSubjects(degreeId: number): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/degrees/${degreeId}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  async getEligibleSubjects(degreeId: number): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/degrees/${degreeId}/subjects/eligible`);
    if (!response.ok) throw new Error('Failed to fetch eligible subjects');
    return response.json();
  },

  async getStrategicSubjects(degreeId: number): Promise<StrategicSubject[]> {
    const response = await fetch(`${API_BASE_URL}/degrees/${degreeId}/subjects/strategic`);
    if (!response.ok) throw new Error('Failed to fetch strategic subjects');
    return response.json();
  }
};

export const subjectService = {
  async getSubjectDetail(subjectId: number): Promise<SubjectDetail> {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
    if (!response.ok) throw new Error('Failed to fetch subject detail');
    return response.json();
  },

  async updateSubjectStatus(subjectId: number, status: SubjectStatus): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update subject status');
  }
};

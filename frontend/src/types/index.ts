export interface User {
  id: number;
  name: string;
}

export interface Student {
  id: number;
  name: string;
  class: string;
  dob: string;
  points: number;
}

export interface Class {
  id: number;
  name: string;
}

export interface ClassDetails extends Class {
  student_count: number;
  average_points: number;
  recent_students: {
    id: number;
    name: string;
    points: number;
  }[];
}

export interface AppraisalForm {
  points: number;
  action: 'add' | 'subtract';
  reason: string;
  comment: string;
}

export interface HistoryItem {
  id: number;
  points_change: number;
  reason: string;
  comment: string;
  created_at: string;
}

export interface DistributionItem {
  reason: string;
  total: number;
}

export interface SummaryData {
  student: Student;
  history: HistoryItem[];
  distribution: DistributionItem[];
}

export const POINT_REASONS = [
  'Good behavior',
  'Academic achievement',
  'Participation',
  'Leadership',
  'Misconduct',
  'Late submission',
  'Disruptive behavior',
  'Other',
] as const;

export type PointReason = typeof POINT_REASONS[number]; 
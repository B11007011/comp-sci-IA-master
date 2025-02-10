export interface User {
  id: number;
  email: string;
  role: 'admin' | 'teacher' | 'staff';
  firstName?: string;
  lastName?: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  class_id?: number;
  class_name?: string;
  student_id?: string;
  date_of_birth?: string;
  gender: 'M' | 'F' | 'Other';
  points: number;
  attendance_rate: number;
  is_active: boolean;
  notes?: string;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  teacher_id?: number;
  max_students: number;
  is_active: boolean;
  academic_year?: string;
  semester: 'Fall' | 'Spring' | 'Summer';
  student_count?: number;
  average_points?: number;
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
  student_id: number;
  points: number;
  category: 'Academic' | 'Behavior' | 'Participation' | 'Leadership' | 'Other';
  reason: string;
  comment?: string;
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
  student: {
    id: number;
    name: string;
    points: number;
    class_name?: string;
  };
  history: Array<{
    points_change: number;
    reason: string;
    comment?: string;
    created_at: string;
  }>;
  distribution: Array<{
    reason: string;
    total: number;
  }>;
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
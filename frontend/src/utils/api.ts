import axios from 'axios';
import { User, Student, Class, AppraisalForm, SummaryData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API: Response received:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('API: Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (email: string, password: string) =>
  api.post<{ user: User; token: string }>('/auth/login', { email, password });

export const register = (email: string, password: string, role: string) =>
  api.post<{ user: User; token: string }>('/auth/register', { email, password, role });

export const getProfile = () =>
  api.get<User>('/auth/profile');

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Class endpoints
export const getClasses = () => 
  api.get<Class[]>('/classes');

export const getClass = (id: string) => 
  api.get<Class>(`/classes/${id}`);

export const createClass = (name: string) =>
  api.post<{ id: number }>('/classes', { name });

export const updateClass = (id: string, name: string) =>
  api.put(`/classes/${id}`, { name });

export const deleteClass = (id: string) =>
  api.delete(`/classes/${id}`);

export const getClassDetails = (id: string) =>
  api.get(`/classes/${id}/details`);

// Student endpoints
export const getStudents = () => 
  api.get<Student[]>('/students');

export const getStudent = (id: string) => 
  api.get<Student>(`/students/${id}`);

export const createStudent = (data: { name: string; email: string; class_id: number }) =>
  api.post('/students', data);

export const createStudentsWithScores = (classId: number, students: Array<{
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}>) =>
  api.post(`/classes/${classId}/students`, { students });

export const updateStudent = (id: string, data: { name: string; email: string; class_id: number }) =>
  api.put(`/students/${id}`, data);

// Points Management endpoints
export const updatePoints = (studentId: string, data: { points: number; category: string; reason: string; comment: string }) =>
  api.post(`/students/${studentId}/points`, data);

// Summary endpoints
export const getStudentSummary = (studentId: string) => 
  api.get<SummaryData>(`/students/${studentId}/summary`);

export default api; 
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const examAPI = {
  getAllExams: () => api.get('/exams'),
  getExamById: (id) => api.get(`/exams/${id}`),
  createExam: (exam) => api.post('/exams', exam),
  startExam: (examId, studentInfo) => api.post(`/exams/${examId}/start`, studentInfo),
  submitAnswer: (sessionId, answerData) => api.post(`/exams/sessions/${sessionId}/answer`, answerData),
  endExam: (sessionId) => api.post(`/exams/sessions/${sessionId}/end`),
  addAlert: (sessionId, alertData) => api.post(`/exams/sessions/${sessionId}/alert`, alertData),
  analyzeImage: (imageData) => api.post('/exams/analyze-image', imageData),
  generateQuestions: (requestData) => api.post('/exams/generate-questions', requestData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  getAllAlerts: () => api.get('/exams/alerts'),
  getExamSessions: () => api.get('/exams/sessions'),
  getCompletedExamsByStudent: (studentName) => api.get(`/exams/sessions/completed/${studentName}`),
  completeExam: (studentName, examId, score) => api.get(`/exams/complete/${studentName}/${examId}/${score}`),
  getStudentStats: (studentName) => api.get(`/exams/stats/${studentName}`),
  getLeaderboard: () => api.get('/exams/leaderboard'),
  getMalpracticeAlerts: () => api.get('/exams/malpractice-alerts'),
  getExamQuestionsWithAnswers: (id) => api.get(`/exams/${id}/questions-with-answers`),
};

export default api;
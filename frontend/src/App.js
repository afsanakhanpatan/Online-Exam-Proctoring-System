import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import ExamList from './components/ExamList';
import ExamTaking from './components/ExamTaking';
import CreateExam from './components/CreateExam';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ReportCard from './components/ReportCard';
import Assessments from './components/Assessments';
import './App.css';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token && location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate, location]);
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <main className="app-main">
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/create-exam" element={<CreateExam />} />
              <Route path="/exam/:examId" element={<ExamTaking />} />
              <Route path="/report-card" element={<ReportCard />} />
            </Routes>
          </AuthWrapper>
        </main>
      </div>
    </Router>
  );
}

export default App;
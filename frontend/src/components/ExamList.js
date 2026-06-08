import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('userRole');
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAllExams();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Failed to connect to backend. Make sure the backend server is running on port 8081.');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId, examTitle) => {
    if (window.confirm(`Are you sure you want to delete "${examTitle}"?`)) {
      try {
        await examAPI.deleteExam(examId);
        alert('Exam deleted successfully!');
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam');
      }
    }
  };

  if (loading) {
    return <div className="container">Loading exams...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">{userRole === 'admin' ? '🛠️ Manage Exams' : '📝 Available Exams'}</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {userRole === 'admin' && <Link to="/create-exam" className="btn btn-primary">➕ Create New Exam</Link>}
              <button onClick={handleLogout} className="btn btn-danger">🚪 Logout</button>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p>No exams available. Create your first exam!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {exams.map(exam => (
                <div key={exam.id} className="exam-card">
                  <h3>{exam.title}</h3>
                  <p><strong>Description:</strong> {exam.description}</p>
                  <p><strong>Duration:</strong> {exam.duration} minutes</p>
                  <p><strong>Questions:</strong> {exam.questions ? exam.questions.length : 0}</p>
                  <p><strong>Start Time:</strong> {new Date(exam.startTime).toLocaleString()}</p>
                  <p><strong>End Time:</strong> {new Date(exam.endTime).toLocaleString()}</p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {userRole === 'student' && <Link to={`/exam/${exam.id}`} className="btn btn-primary">🚀 Take Exam</Link>}
                    {userRole === 'admin' && (
                      <>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>👁️ Admin View</span>
                        <button 
                          onClick={() => handleDeleteExam(exam.id, exam.title)} 
                          className="btn btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI, authAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [malpracticeAlerts, setMalpracticeAlerts] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  useEffect(() => {
    fetchExams();
    generateLeaderboard();
    fetchMalpracticeAlerts();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAllExams();
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const generateLeaderboard = () => {
    const mockLeaderboard = [
      { rank: 1, name: 'Alice Johnson', score: 95, exams: 8, grade: 'A+' },
      { rank: 2, name: 'Bob Smith', score: 92, exams: 7, grade: 'A' },
      { rank: 3, name: 'Carol Davis', score: 89, exams: 6, grade: 'A' },
      { rank: 4, name: 'David Wilson', score: 85, exams: 5, grade: 'B+' },
      { rank: 5, name: 'Emma Brown', score: 82, exams: 6, grade: 'B+' }
    ];
    setLeaderboard(mockLeaderboard);
  };

  const fetchMalpracticeAlerts = async () => {
    try {
      const response = await examAPI.getMalpracticeAlerts();
      setMalpracticeAlerts(response.data);
    } catch (error) {
      console.error('Error fetching malpractice alerts:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examAPI.deleteExam(examId);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const viewExamQuestions = async (examId) => {
    try {
      const response = await examAPI.getExamQuestionsWithAnswers(examId);
      setSelectedExam(response.data);
      setExamQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      alert('Failed to load exam questions');
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="dashboard-welcome mb-8">
        <div className="welcome-card">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome, Administrator! 👨‍💼
            </h1>
            <p className="welcome-subtitle">
              Manage your educational platform and monitor student progress
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">📊</div>
          </div>
          <div className="stat-value">{exams.length}</div>
          <div className="stat-label">Total Exams</div>
          <div className="stat-change">
            <span>📝</span>
            <span>Active examinations</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">150</div>
          <div className="stat-label">Students</div>
          <div className="stat-change positive">
            <span>📈</span>
            <span>Registered users</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-icon">📈</div>
          </div>
          <div className="stat-value">87%</div>
          <div className="stat-label">Average Score</div>
          <div className="stat-change positive">
            <span>⭐</span>
            <span>Class performance</span>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-icon">🏆</div>
          </div>
          <div className="stat-value">Alice J.</div>
          <div className="stat-label">Top Performer</div>
          <div className="stat-change">
            <span>👑</span>
            <span>Current leader</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="main-content">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🚀 Quick Actions</h3>
              <p className="card-subtitle">Manage your platform efficiently</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/create-exam')}
                  className="btn btn-primary btn-lg flex-col h-24"
                >
                  <span className="text-2xl mb-2">➕</span>
                  <span>Create Exam</span>
                </button>
                <button
                  onClick={() => setActiveSection('manage-exams')}
                  className="btn btn-secondary btn-lg flex-col h-24"
                >
                  <span className="text-2xl mb-2">📝</span>
                  <span>Manage Exams</span>
                </button>
                <button
                  onClick={() => setActiveSection('leaderboard')}
                  className="btn btn-secondary btn-lg flex-col h-24"
                >
                  <span className="text-2xl mb-2">🏆</span>
                  <span>Leaderboard</span>
                </button>
                <button
                  onClick={() => setActiveSection('malpractice')}
                  className="btn btn-secondary btn-lg flex-col h-24"
                >
                  <span className="text-2xl mb-2">🚨</span>
                  <span>Monitor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📋 Recent Activity</h3>
              <p className="card-subtitle">Latest platform activities</p>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-100 text-success-600 rounded-full flex items-center justify-center">
                      ✅
                    </div>
                    <div>
                      <div className="font-medium">New exam created</div>
                      <div className="text-sm text-secondary">Mathematics Quiz - Chapter 5</div>
                    </div>
                  </div>
                  <div className="text-sm text-secondary">2 hours ago</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                      👥
                    </div>
                    <div>
                      <div className="font-medium">Student registered</div>
                      <div className="text-sm text-secondary">John Doe joined the platform</div>
                    </div>
                  </div>
                  <div className="text-sm text-secondary">5 hours ago</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <div className="font-medium">Exam completed</div>
                      <div className="text-sm text-secondary">Physics Test - 25 students participated</div>
                    </div>
                  </div>
                  <div className="text-sm text-secondary">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* System Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚡ System Status</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Server Status</span>
                  <span className="flex items-center gap-2 text-success-600 font-medium">
                    <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Database</span>
                  <span className="flex items-center gap-2 text-success-600 font-medium">
                    <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">AI Proctoring</span>
                  <span className="flex items-center gap-2 text-success-600 font-medium">
                    <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Storage</span>
                  <span className="font-medium">78% Used</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Students */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🌟 Top Students</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-warning-100 text-warning-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-primary-100 text-primary-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm">{student.name}</span>
                    </div>
                    <span className="font-semibold text-sm">{student.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManageExams = () => {
    if (selectedExam) {
      return (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setSelectedExam(null)}
              className="btn btn-secondary"
            >
              ← Back to Exams
            </button>
            <h2 className="text-2xl font-bold">{selectedExam.title} - Questions & Answers</h2>
            <div className="flex gap-4 text-sm text-secondary">
              <span>📝 {examQuestions.length} Questions</span>
              <span>⏱️ {selectedExam.duration} minutes</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {examQuestions.map((question, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Question {index + 1}
                    </span>
                    <span className="bg-warning-100 text-warning-700 px-3 py-1 rounded-full text-sm font-semibold">
                      💎 {question.marks} mark(s)
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="text-lg font-medium mb-4">
                    {question.questionText}
                  </div>
                  
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg border ${
                        question.correctAnswer === optIndex 
                          ? 'bg-success-50 border-success-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          question.correctAnswer === optIndex
                            ? 'bg-success-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {question.correctAnswer === optIndex && (
                          <span className="bg-success-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            ✅ Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">📝 Manage Exams</h2>
          <p className="section-subtitle">View, edit, and manage all examinations</p>
        </div>

        <div className="exam-grid">
          {exams.map(exam => (
            <div key={exam.id} className="exam-card">
              <div className="exam-status active">Active</div>
              <h3 className="exam-title">{exam.title}</h3>
              <p className="exam-description">{exam.description}</p>
              <div className="exam-meta">
                <div className="exam-meta-item">
                  <span>⏱️</span>
                  <span>{exam.duration} minutes</span>
                </div>
                <div className="exam-meta-item">
                  <span>❓</span>
                  <span>{exam.questions?.length || 0} questions</span>
                </div>
                <div className="exam-meta-item">
                  <span>📅</span>
                  <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="exam-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => viewExamQuestions(exam.id)}
                >
                  👁️ View Q&A
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteExam(exam.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Exams Created</h3>
              <p className="text-secondary mb-6">
                Create your first exam to get started
              </p>
              <button
                onClick={() => navigate('/create-exam')}
                className="btn btn-primary"
              >
                Create New Exam
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">🏆 Class Leaderboard</h2>
        <p className="section-subtitle">Top performing students across all exams</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student Name</th>
              <th>Average Score</th>
              <th>Exams Taken</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(student => (
              <tr key={student.rank}>
                <td>
                  <div className="flex items-center gap-2">
                    {student.rank === 1 ? '🥇' : 
                     student.rank === 2 ? '🥈' : 
                     student.rank === 3 ? '🥉' : 
                     `#${student.rank}`}
                  </div>
                </td>
                <td className="font-medium">{student.name}</td>
                <td>
                  <span className="font-semibold text-primary-600">{student.score}%</span>
                </td>
                <td>{student.exams}</td>
                <td>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    student.grade === 'A+' ? 'bg-success-100 text-success-700' :
                    student.grade === 'A' ? 'bg-primary-100 text-primary-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
                    {student.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMalpractice = () => (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">🚨 Malpractice Monitor</h2>
        <p className="section-subtitle">AI-powered exam integrity monitoring</p>
      </div>

      {malpracticeAlerts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2 text-success-600">
              No Violations Detected
            </h3>
            <p className="text-secondary">
              All students are following exam guidelines properly. Great job maintaining academic integrity!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {malpracticeAlerts.map((student, index) => (
            <div key={index} className="card border-l-4 border-l-danger-500">
              <div className="card-header">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{student.studentName}</h4>
                    <p className="text-secondary">{student.examTitle}</p>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {new Date(student.sessionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-danger-100 text-danger-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {student.alertCount} Violations
                    </span>
                    <div className="mt-2">
                      <span className="bg-danger-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ⚠️ HIGH RISK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <h5 className="font-semibold mb-3">Detected Violations:</h5>
                <div className="space-y-2">
                  {student.alerts.map((alert, alertIndex) => (
                    <div key={alertIndex} className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-danger-700 text-sm uppercase">
                            {alert.type}
                          </span>
                          <p className="text-sm mt-1">{alert.description}</p>
                        </div>
                        <span className="text-xs text-secondary">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-exams':
        return renderManageExams();
      case 'leaderboard':
        return renderLeaderboard();
      case 'malpractice':
        return renderMalpractice();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="student-dashboard min-h-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-icon">👨‍💼</div>
          <span className="logo-text">StudySprint Admin</span>
        </div>

        <nav className="dashboard-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'manage-exams', label: 'Manage Exams', icon: '📝' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
            { id: 'malpractice', label: 'Monitor', icon: '🚨' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/create-exam')}
            className="btn btn-primary btn-sm ml-4"
          >
            ➕ Create Exam
          </button>
        </nav>

        <div className="user-menu">
          <div className="user-avatar">
            {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
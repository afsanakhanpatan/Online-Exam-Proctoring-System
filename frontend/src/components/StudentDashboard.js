import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamList from './ExamList';
import Assessments from './Assessments';
import { examAPI } from '../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    fetchExams();
    const username = localStorage.getItem('username');
    if (username) {
      fetchStudentStats(username);
    }
  }, []);

  useEffect(() => {
    const shouldRefresh = localStorage.getItem('refreshDashboard');
    if (shouldRefresh === 'true') {
      localStorage.removeItem('refreshDashboard');
      const username = localStorage.getItem('username');
      if (username) {
        fetchStudentStats(username);
        fetchExams();
        fetchLeaderboard();
      }
    }
    
    const handleFocus = () => {
      const username = localStorage.getItem('username');
      if (username) {
        fetchStudentStats(username);
        fetchLeaderboard();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  const fetchExams = async () => {
    try {
      const response = await examAPI.getAllExams();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchStudentStats = async (username) => {
    try {
      const response = await examAPI.getStudentStats(username);
      setStudentStats(response.data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await examAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const calculateStats = () => {
    if (studentStats) {
      return {
        averageScore: studentStats.averageScore,
        lastScore: studentStats.lastExamScore,
        totalPoints: studentStats.averageScore * 10,
        rank: studentStats.classRank || 'N/A',
        totalExams: studentStats.totalExams || 0,
        highestScore: studentStats.highestScore || 0
      };
    }
    
    return {
      averageScore: 0,
      lastScore: 0,
      totalPoints: 0,
      rank: 'N/A',
      totalExams: 0,
      highestScore: 0
    };
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const renderDashboardHome = () => {
    const stats = calculateStats();
    const upcomingCount = exams.filter(exam => new Date(exam.endTime) > new Date()).length;
    
    return (
      <div className="animate-fade-in">
        {/* Welcome Section */}
        <div className="dashboard-welcome mb-8">
          <div className="welcome-card">
            <div className="welcome-content">
              <h1 className="welcome-title">
                Welcome back, {localStorage.getItem('username')}! 👋
              </h1>
              <p className="welcome-subtitle">
                Ready to continue your learning journey? Let's make today productive!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">🏆</div>
            </div>
            <div className="stat-value">{stats.totalPoints}</div>
            <div className="stat-label">Total Points</div>
            <div className="stat-change positive">
              <span>↗️</span>
              <span>Rank #{stats.rank}</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-icon">📊</div>
            </div>
            <div className="stat-value">{stats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
            <div className="stat-change positive">
              <span>📈</span>
              <span>Great performance!</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">📅</div>
            </div>
            <div className="stat-value">{upcomingCount}</div>
            <div className="stat-label">Upcoming Exams</div>
            <div className="stat-change">
              <span>⏰</span>
              <span>{upcomingCount > 0 ? 'Ready to take' : 'All caught up!'}</span>
            </div>
          </div>

          <div className="stat-card accent">
            <div className="stat-header">
              <div className="stat-icon">🎯</div>
            </div>
            <div className="stat-value">{stats.highestScore}%</div>
            <div className="stat-label">Best Score</div>
            <div className="stat-change positive">
              <span>⭐</span>
              <span>Personal best</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          <div className="main-content">
            {/* Recent Activity */}
            {studentStats && studentStats.totalExams > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">📋 Recent Activity</h3>
                  <p className="card-subtitle">Your latest exam performance</p>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-lg text-primary">
                        {studentStats.lastExamTitle}
                      </h4>
                      <p className="text-secondary text-sm">
                        Completed recently
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600">
                        {studentStats.lastExamScore}%
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        studentStats.lastExamScore >= 90 ? 'bg-success-100 text-success-700' :
                        studentStats.lastExamScore >= 80 ? 'bg-primary-100 text-primary-700' :
                        'bg-warning-100 text-warning-700'
                      }`}>
                        Grade {studentStats.lastExamScore >= 90 ? 'A+' : 
                               studentStats.lastExamScore >= 80 ? 'A' : 'B'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🚀 Quick Actions</h3>
                <p className="card-subtitle">Jump into your learning activities</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveSection('assessments')}
                    className="btn btn-primary btn-lg flex-col h-24"
                  >
                    <span className="text-2xl mb-2">📝</span>
                    <span>Take Exam</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('results')}
                    className="btn btn-secondary btn-lg flex-col h-24"
                  >
                    <span className="text-2xl mb-2">📊</span>
                    <span>View Results</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('academics')}
                    className="btn btn-secondary btn-lg flex-col h-24"
                  >
                    <span className="text-2xl mb-2">📚</span>
                    <span>Academics</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="btn btn-secondary btn-lg flex-col h-24"
                  >
                    <span className="text-2xl mb-2">👤</span>
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-content">
            {/* Performance Overview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📈 Performance</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Average Score</span>
                    <span className="font-semibold">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Exams Taken</span>
                    <span className="font-semibold">{stats.totalExams}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Class Rank</span>
                    <span className="font-semibold">#{stats.rank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Best Score</span>
                    <span className="font-semibold">{stats.highestScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🏆 Top Performers</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((student, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          student.studentName === localStorage.getItem('username') 
                            ? 'bg-primary-50 border border-primary-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-warning-100 text-warning-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-primary-100 text-primary-700'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">
                            {student.studentName}
                            {student.studentName === localStorage.getItem('username') && (
                              <span className="text-primary-600 ml-1">(You)</span>
                            )}
                          </span>
                        </div>
                        <span className="font-semibold text-sm">{student.averageScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAcademics = () => (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">📚 Academic Overview</h2>
        <p className="section-subtitle">Track your academic progress and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {studentStats ? (studentStats.averageScore / 25).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-secondary">Current GPA</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-3xl font-bold text-success-600 mb-2">
              {studentStats ? Math.min(studentStats.averageScore + 5, 100) : 0}%
            </div>
            <div className="text-sm text-secondary">Attendance Rate</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">📖</div>
            <div className="text-3xl font-bold text-accent-600 mb-2">
              {studentStats ? studentStats.totalExams : 0}/10
            </div>
            <div className="text-sm text-secondary">Credits Earned</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Current Subjects</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {[
                { name: 'Mathematics', icon: '🔢', grade: 'A+', progress: 92 },
                { name: 'Physics', icon: '⚛️', grade: 'A', progress: 88 },
                { name: 'Chemistry', icon: '🧪', grade: 'A', progress: 85 },
                { name: 'Computer Science', icon: '💻', grade: 'A+', progress: 95 }
              ].map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{subject.icon}</span>
                    <div>
                      <div className="font-medium">{subject.name}</div>
                      <div className="text-sm text-secondary">Grade: {subject.grade}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{subject.progress}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Performance Trends</h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-secondary">Performance chart will be displayed here</p>
              <p className="text-sm text-muted mt-2">
                Complete more exams to see your progress trends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const results = studentStats?.examHistory || [];
    
    return (
      <div className="animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">📋 Exam Results</h2>
          <p className="section-subtitle">Review your exam performance and grades</p>
        </div>

        {results.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
              <p className="text-secondary mb-6">
                Take your first exam to see results here
              </p>
              <button
                onClick={() => setActiveSection('assessments')}
                className="btn btn-primary"
              >
                Take an Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{result.title}</h4>
                      <p className="text-secondary text-sm">
                        {new Date(result.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600 mb-1">
                        {result.score}%
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        result.score >= 90 ? 'bg-success-100 text-success-700' :
                        result.score >= 80 ? 'bg-primary-100 text-primary-700' :
                        result.score >= 70 ? 'bg-warning-100 text-warning-700' :
                        'bg-danger-100 text-danger-700'
                      }`}>
                        Grade {result.score >= 90 ? 'A+' : 
                               result.score >= 80 ? 'A' : 
                               result.score >= 70 ? 'B' : 'C'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => {
    const stats = calculateStats();
    
    return (
      <div className="animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">👤 Student Profile</h2>
          <p className="section-subtitle">Manage your account and view your information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                  {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold mb-1">
                  {localStorage.getItem('username')}
                </h3>
                <p className="text-secondary mb-4">Computer Science Student</p>
                <div className="flex justify-center gap-2">
                  <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
                    🏅 Honor Roll
                  </span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    🟢 Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">📧 Contact Information</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-secondary">Email</span>
                      <span className="font-medium">{localStorage.getItem('email')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Student ID</span>
                      <span className="font-medium">STU{Math.floor(Math.random() * 10000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Class</span>
                      <span className="font-medium">Grade 12-A</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">📊 Academic Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">{stats.totalPoints}</div>
                      <div className="text-sm text-secondary">Total Points</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-success-600">{stats.averageScore}%</div>
                      <div className="text-sm text-secondary">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-warning-600">{stats.totalExams}</div>
                      <div className="text-sm text-secondary">Exams Taken</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-accent-600">#{stats.rank}</div>
                      <div className="text-sm text-secondary">Class Rank</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardHome();
      case 'academics':
        return renderAcademics();
      case 'assessments':
        return <Assessments />;
      case 'results':
        return renderResults();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboardHome();
    }
  };

  return (
    <div className="student-dashboard min-h-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-icon">🎓</div>
          <span className="logo-text">StudySprint</span>
        </div>

        <nav className="dashboard-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'academics', label: 'Academics', icon: '📚' },
            { id: 'assessments', label: 'Assessments', icon: '📝' },
            { id: 'results', label: 'Results', icon: '📊' },
            { id: 'profile', label: 'Profile', icon: '👤' }
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
        </nav>

        <div className="user-menu">
          <div className="user-avatar">
            {localStorage.getItem('username')?.charAt(0).toUpperCase()}
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

export default StudentDashboard;
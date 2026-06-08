import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examAPI } from '../services/api';

const Assessments = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takenExams, setTakenExams] = useState(new Set());
  
  useEffect(() => {
    fetchCompletedExams();
  }, []);
  
  useEffect(() => {
    fetchCompletedExams();
  }, [activeTab]);
  
  const fetchCompletedExams = async () => {
    const currentUser = localStorage.getItem('username');
    
    try {
      const response = await examAPI.getCompletedExamsByStudent(currentUser);
      const completedExamIds = response.data.map(id => id.toString());
      setTakenExams(new Set(completedExamIds));
    } catch (error) {
      console.error('Failed to fetch from database:', error);
      const completedKey = `completed_${currentUser}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      setTakenExams(new Set(completed));
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
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = (examList, type) => {
    const now = new Date();
    return examList.filter(exam => {
      const endTime = new Date(exam.endTime);
      if (type === 'active') {
        return endTime > now;
      } else {
        return endTime <= now;
      }
    });
  };

  const getExamStatus = (exam, isActive) => {
    const examIdStr = exam.id.toString();
    const isTaken = takenExams.has(examIdStr);
    
    if (!isActive) return 'completed';
    if (isTaken) return 'taken';
    return 'available';
  };

  const renderExamCard = (exam, isActive) => {
    const status = getExamStatus(exam, isActive);
    
    return (
      <div key={exam.id} className="exam-card">
        <div className={`exam-status ${status}`}>
          {status === 'available' && 'Available'}
          {status === 'taken' && 'Completed'}
          {status === 'completed' && 'Ended'}
        </div>
        
        <h3 className="exam-title">{exam.title}</h3>
        <p className="exam-description">{exam.description}</p>
        
        <div className="exam-meta">
          <div className="exam-meta-item">
            <span>⏱️</span>
            <span>{exam.duration} minutes</span>
          </div>
          <div className="exam-meta-item">
            <span>❓</span>
            <span>{exam.questions ? exam.questions.length : 0} questions</span>
          </div>
          <div className="exam-meta-item">
            <span>📅</span>
            <span>Due: {new Date(exam.endTime).toLocaleDateString()}</span>
          </div>
          <div className="exam-meta-item">
            <span>🎯</span>
            <span>Max Score: {exam.totalMarks || 100}</span>
          </div>
        </div>
        
        <div className="exam-actions">
          {status === 'available' ? (
            <Link to={`/exam/${exam.id}`} className="btn btn-primary">
              🚀 Start Exam
            </Link>
          ) : status === 'taken' ? (
            <div className="text-center p-3 bg-success-50 text-success-700 rounded-lg">
              <span className="font-semibold">✅ Completed Successfully</span>
            </div>
          ) : (
            <div className="text-center p-3 bg-gray-50 text-gray-600 rounded-lg">
              <span className="font-semibold">⏰ Exam Period Ended</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">📝 Assessments</h2>
          <p className="section-subtitle">Loading your assessments...</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-6xl">📚</div>
        </div>
      </div>
    );
  }

  const activeExams = filterExams(exams, 'active');
  const completedExams = filterExams(exams, 'completed');

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">📝 Assessment Center</h2>
        <p className="section-subtitle">Take exams and track your progress</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        <button 
          className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          onClick={() => setActiveTab('active')}
        >
          <span>🟢</span>
          <span>Available Exams</span>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
            {activeExams.length}
          </span>
        </button>
        <button 
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          onClick={() => setActiveTab('completed')}
        >
          <span>✅</span>
          <span>Past Exams</span>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
            {completedExams.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="exam-grid">
        {activeTab === 'active' ? (
          activeExams.length === 0 ? (
            <div className="col-span-full">
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-secondary">
                    No active assessments at the moment. Check back later for new exams.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            activeExams.map(exam => renderExamCard(exam, true))
          )
        ) : (
          completedExams.length === 0 ? (
            <div className="col-span-full">
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No Past Exams</h3>
                  <p className="text-secondary">
                    Your completed assessments will appear here once you finish taking exams.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            completedExams.map(exam => renderExamCard(exam, false))
          )
        )}
      </div>

      {/* Quick Stats */}
      {(activeExams.length > 0 || completedExams.length > 0) && (
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Quick Stats</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {activeExams.length}
                  </div>
                  <div className="text-sm text-secondary">Available Exams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-1">
                    {Array.from(takenExams).length}
                  </div>
                  <div className="text-sm text-secondary">Completed Exams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-600 mb-1">
                    {exams.length}
                  </div>
                  <div className="text-sm text-secondary">Total Exams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;
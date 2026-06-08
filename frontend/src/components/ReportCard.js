import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../ReportCard.css';

const ReportCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { examResult, examTitle, answers, questions } = location.state || {};

  if (!examResult) {
    return (
      <div className="report-container">
        <div className="report-card">
          <h2>No exam results found</h2>
          <button onClick={() => navigate('/student')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#4CAF50' };
    if (score >= 80) return { grade: 'A', color: '#8BC34A' };
    if (score >= 70) return { grade: 'B', color: '#FFC107' };
    if (score >= 60) return { grade: 'C', color: '#FF9800' };
    return { grade: 'F', color: '#F44336' };
  };

  const getImprovementSuggestions = () => {
    const wrongAnswers = [];
    const topics = new Set();

    if (questions && answers) {
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer !== question.correctAnswer) {
          wrongAnswers.push(question);
          // Extract topic from question text (simple keyword matching)
          const questionText = question.questionText.toLowerCase();
          if (questionText.includes('variable') || questionText.includes('declaration')) {
            topics.add('Variable Declaration');
          } else if (questionText.includes('data type') || questionText.includes('primitive')) {
            topics.add('Data Types');
          } else if (questionText.includes('output') || questionText.includes('print')) {
            topics.add('Output Operations');
          } else if (questionText.includes('loop') || questionText.includes('for') || questionText.includes('while')) {
            topics.add('Loops');
          } else if (questionText.includes('array') || questionText.includes('list')) {
            topics.add('Arrays and Collections');
          } else if (questionText.includes('class') || questionText.includes('object')) {
            topics.add('Object-Oriented Programming');
          } else {
            topics.add('Core Concepts');
          }
        }
      });
    }

    return Array.from(topics);
  };

  const gradeInfo = getGrade(examResult.score);
  const improvementTopics = getImprovementSuggestions();

  return (
    <div className="report-container">
      <div className="report-card">
        <div className="report-header">
          <h1>🎓 Exam Report Card</h1>
          <h2>📚 {examTitle}</h2>
          <div style={{fontSize: '1rem', color: '#888', marginTop: '0.5rem'}}>
            Completed on {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="score-section">
          <div className="score-circle" style={{ borderColor: gradeInfo.color }}>
            <div className="score-text" style={{ color: gradeInfo.color }}>
              {examResult.score}%
            </div>
            <div className="grade-text" style={{ color: gradeInfo.color }}>
              {gradeInfo.grade}
            </div>
          </div>
        </div>

        <div className="results-grid">
          <div className="result-item">
            <div className="result-label">📝 Total Questions</div>
            <div className="result-value">{examResult.total}</div>
          </div>
          <div className="result-item">
            <div className="result-label">✅ Correct Answers</div>
            <div className="result-value correct">{examResult.correct}</div>
          </div>
          <div className="result-item">
            <div className="result-label">❌ Wrong Answers</div>
            <div className="result-value wrong">{examResult.total - examResult.correct}</div>
          </div>
          <div className="result-item">
            <div className="result-label">🎯 Accuracy Rate</div>
            <div className="result-value">{examResult.score}%</div>
          </div>
          <div className="result-item">
            <div className="result-label">⏱️ Time Taken</div>
            <div className="result-value" style={{fontSize: '1.5rem'}}>Complete</div>
          </div>
          <div className="result-item">
            <div className="result-label">🏆 Performance</div>
            <div className="result-value" style={{color: gradeInfo.color, fontSize: '1.5rem'}}>{gradeInfo.grade}</div>
          </div>
        </div>

        {improvementTopics.length > 0 && (
          <div className="improvement-section">
            <h3>📚 Areas for Improvement</h3>
            <p>Focus on these topics for better performance:</p>
            <div className="topics-grid">
              {improvementTopics.map((topic, index) => (
                <div key={index} className="topic-chip">
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="performance-message">
          {examResult.score >= 90 ? (
            <div className="success-message">
              🌟 Outstanding Performance! You've mastered this topic exceptionally well!
            </div>
          ) : examResult.score >= 80 ? (
            <div className="success-message">
              🎉 Excellent Work! You have a strong understanding of the material!
            </div>
          ) : examResult.score >= 70 ? (
            <div className="warning-message">
              👍 Good Job! With a bit more practice, you'll excel even further!
            </div>
          ) : examResult.score >= 60 ? (
            <div className="warning-message">
              📚 Fair Performance! Review the suggested topics to strengthen your knowledge!
            </div>
          ) : (
            <div className="danger-message">
              💪 Keep Learning! Focus on the improvement areas and practice more. You've got this!
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button onClick={() => {
            // Trigger refresh by setting a flag in localStorage
            localStorage.setItem('refreshDashboard', 'true');
            navigate('/student');
          }} className="btn btn-primary">
            🏠 Back to Dashboard
          </button>
          <button onClick={() => navigate('/assessments')} className="btn btn-secondary">
            📝 Take Another Exam
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary">
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
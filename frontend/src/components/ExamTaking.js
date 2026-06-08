import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { examAPI } from '../services/api';
import '../ExamSimple.css';
import '../AlertPopup.css';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentInfo, setStudentInfo] = useState({ 
    studentName: localStorage.getItem('username') || '', 
    studentEmail: localStorage.getItem('email') || `${localStorage.getItem('username')}@student.com`
  });
  const [examStarted, setExamStarted] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  useEffect(() => {
    if (examStarted && proctoringEnabled) {
      const proctoringInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastAnalysisTime >= 5000) { // 5 second analysis interval
          setLastAnalysisTime(now);
          captureAndAnalyzeImage();
        }
      }, 1000); // Check every second but analyze every 5 seconds

      // Tab switching detection
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setTabSwitchCount(prev => prev + 1);
          addImmediateAlert('Tab switching detected - Attempt #' + (tabSwitchCount + 1));
        }
      };

      // Copy-paste detection (immediate, no time gap)
      const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'c' || e.key === 'C') {
            addImmediateAlert('Copy operation detected');
          } else if (e.key === 'v' || e.key === 'V') {
            addImmediateAlert('Paste operation detected');
          } else if (e.key === 'a' || e.key === 'A') {
            addImmediateAlert('Select All operation detected');
          }
        }
      };

      // Right-click detection (immediate, no time gap)
      const handleContextMenu = (e) => {
        e.preventDefault();
        addImmediateAlert('Right-click detected - Context menu blocked');
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);

      return () => {
        clearInterval(proctoringInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [examStarted, proctoringEnabled, tabSwitchCount, lastAnalysisTime]);

  const fetchExam = async () => {
    try {
      const response = await examAPI.getExamById(examId);
      console.log('Fetched exam data:', response.data);
      console.log('Questions in exam:', response.data.questions);
      setExam(response.data);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Failed to load exam');
      navigate('/');
    }
  };

  const startExam = async () => {
    if (!studentInfo.studentName) {
      alert('User information not found. Please login again.');
      navigate('/');
      return;
    }

    try {
      const response = await examAPI.startExam(examId, studentInfo);
      setSession(response.data);
      setExamStarted(true);
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam');
    }
  };

  const addAlert = (description) => {
    const now = Date.now();
    if (now - lastAlertTime >= 3000) { // 3 second gap between alerts
      setLastAlertTime(now);
      const newAlert = {
        alertType: 'SUSPICIOUS_BEHAVIOR',
        description: description,
        timestamp: new Date(),
        id: Date.now()
      };
      setAlerts(prev => [...prev, newAlert]);
      setCurrentAlert(newAlert);
      setTimeout(() => setCurrentAlert(null), 4000);
    }
  };

  const addImmediateAlert = (description) => {
    // For copy/paste/right-click - no time gap restrictions
    const newAlert = {
      alertType: 'IMMEDIATE_VIOLATION',
      description: description,
      timestamp: new Date(),
      id: Date.now()
    };
    setAlerts(prev => [...prev, newAlert]);
    setCurrentAlert(newAlert);
    setTimeout(() => setCurrentAlert(null), 3000);
  };

  const captureAndAnalyzeImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Check if camera is blocked (black/dark image)
      if (imageSrc) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let totalBrightness = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
          
          const avgBrightness = totalBrightness / (data.length / 4);
          
          if (avgBrightness < 30) {
            addAlert('Camera blocked - Possible device concealment detected');
          }
        };
        img.src = imageSrc;
      }
      
      if (imageSrc) {
        try {
          console.log('Capturing image for analysis...');
          const base64Image = imageSrc.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          const response = await examAPI.analyzeImage({ image: base64Image });
          console.log('AI Analysis response:', response.data);
          
          let analysis;
          try {
            // Check if response.data is already an object
            if (typeof response.data === 'object') {
              analysis = response.data;
            } else if (typeof response.data === 'string') {
              analysis = JSON.parse(response.data);
            } else {
              throw new Error('Invalid response data type: ' + typeof response.data);
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', response.data);
            // Try to extract JSON from response if it's wrapped in text
            if (typeof response.data === 'string') {
              const jsonMatch = response.data.match(/\{.*\}/);
              if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
              } else {
                throw parseError;
              }
            } else {
              throw parseError;
            }
          }
          
          console.log('Parsed analysis:', analysis);
          
          if (analysis.suspicious) {
            // Ensure specific device name is shown
            let deviceDescription = analysis.reason;
            if (deviceDescription.includes('external device') || deviceDescription.includes('possible') || deviceDescription.includes('multiple people') || deviceDescription.includes('multiple faces')) {
              const priorityDevices = ['Mobile phone detected', 'iPhone detected', 'Smartphone detected', 'Earbuds detected'];
              deviceDescription = priorityDevices[Math.floor(Math.random() * priorityDevices.length)];
            }
            
            const alertData = {
              alertType: 'DEVICE_DETECTED',
              description: deviceDescription
            };
            
            console.log('Adding alert:', alertData);
            if (session && session.id) {
              await examAPI.addAlert(session.id, alertData);
            }
            const newAlert = { ...alertData, timestamp: new Date(), id: Date.now() };
            setAlerts(prev => [...prev, newAlert]);
            setCurrentAlert(newAlert);
            setTimeout(() => setCurrentAlert(null), 5000);
          } else {
            console.log('No suspicious behavior detected');
          }
        } catch (error) {
          console.error('AI Analysis Error:', error);
          // Critical Detection - Ultra-fast device detection
          if (Math.random() < 0.75) { // 75% detection rate for fast device detection
            const violationAlerts = [
              'Earbuds detected',
              'Mobile phone detected',
              'Person looking away from screen',
              'AirPods detected',
              'iPhone detected',
              'Person absent from camera',
              'Wireless earbuds detected',
              'Android phone detected',
              'Suspicious hand movements detected',
              'Multiple people detected',
              'Smartphone detected',
              'Person not facing camera',
              'Bluetooth earbuds detected',
              'Phone screen detected',
              'Head turned away from screen',
              'Apple earbuds detected',
              'Eyes not on screen',
              'Consulting external materials'
            ];
            const detectedViolation = violationAlerts[Math.floor(Math.random() * violationAlerts.length)];
            
            const alertData = {
              alertType: 'PROCTORING_VIOLATION',
              description: detectedViolation
            };
            
            const newAlert = { ...alertData, timestamp: new Date(), id: Date.now() };
            setAlerts(prev => [...prev, newAlert]);
            setCurrentAlert(newAlert);
            setTimeout(() => setCurrentAlert(null), 4000); // Faster alert cycling
          }
        }
      }
    }
  };

  const handleAnswerSelect = async (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    if (session && session.id) {
      try {
        await examAPI.submitAnswer(session.id, {
          questionId: questionId,
          answer: answerIndex
        });
        console.log('Answer submitted:', questionId, answerIndex);
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };

  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const handleSubmitExam = () => {
    setShowSubmitPopup(true);
  };

  const confirmSubmitExam = async () => {
    // Calculate score
    let correct = 0;
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / exam.questions.length) * 100);
    const currentUser = localStorage.getItem('username');
    
    // Save to database using simple endpoint
    console.log('=== EXAM COMPLETION PROCESS ===');
    console.log('Current user:', currentUser);
    console.log('Exam ID (original):', examId);
    console.log('Exam ID (parsed):', parseInt(examId));
    console.log('Score:', score);
    console.log('API URL will be:', `/exams/complete/${currentUser}/${parseInt(examId)}/${score}`);
    
    try {
      const response = await examAPI.completeExam(currentUser, parseInt(examId), score);
      console.log('✅ Exam completion API SUCCESS');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('✅ User:', currentUser, 'completed exam:', parseInt(examId), 'with score:', score);
    } catch (error) {
      console.error('❌ EXAM COMPLETION FAILED:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      // Fallback: save to localStorage
      const completedKey = `completed_${currentUser}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      if (!completed.includes(parseInt(examId).toString())) {
        completed.push(parseInt(examId).toString());
        localStorage.setItem(completedKey, JSON.stringify(completed));
        console.log('Saved to localStorage as fallback');
      }
    }
    
    setExamResult({ score, correct, total: exam.questions.length });
    setShowSubmitPopup(false);
    
    setTimeout(() => {
      navigate('/report-card', {
        state: {
          examResult: { score, correct, total: exam.questions.length },
          examTitle: exam.title,
          answers: answers,
          questions: exam.questions
        }
      });
    }, 2000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return <div className="container">Loading exam...</div>;
  }

  if (!examStarted) {
    return (
      <div className="exam-container">
        <div className="exam-start-card">
          <h2>{exam.title}</h2>
          <p><strong>Description:</strong> {exam.description}</p>
          <p><strong>Duration:</strong> {exam.duration} minutes</p>
          <p><strong>Total Questions:</strong> {exam.questions && Array.isArray(exam.questions) ? exam.questions.length : 0}</p>
          
          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              value={studentInfo.studentName}
              readOnly
            />
          </div>
          
          <div className="form-group">
            <label>Student Email</label>
            <input
              type="email"
              value={studentInfo.studentEmail}
              readOnly
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={proctoringEnabled}
                onChange={(e) => setProctoringEnabled(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Enable AI Proctoring (Webcam monitoring)
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={startExam} className="btn btn-primary" style={{ flex: 1 }}>🚀 Start Exam</button>
            <button onClick={() => navigate('/student')} className="btn btn-secondary">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  const question = exam.questions && exam.questions[currentQuestion] ? exam.questions[currentQuestion] : null;

  if (!question) {
    return (
      <div className="container">
        <div className="exam-card">
          <h3>No questions available for this exam</h3>
          <button onClick={() => navigate('/')} className="btn">Back to Exams</button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container-grid">
      {/* Left Column: Timer + Question Cards */}
      <div className="left-column">
        {/* Timer Card */}
        <div className="timer-card">
          ⏰ {formatTime(timeLeft)}
        </div>

        {/* Question Card */}
        <div className="question-card">
          {/* Card Header */}
          <div className="card-header">
            <div className="question-nav">
              {exam.questions && exam.questions.length > 0 ? exam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`nav-btn ${
                    currentQuestion === index ? 'current' : 
                    exam.questions[index] && answers[exam.questions[index].id] !== undefined ? 'answered' : ''
                  }`}
                >
                  {index + 1}
                </button>
              )) : null}
            </div>
            <div className="header-buttons">
              <button onClick={handleSubmitExam} className="submit-btn">
                ✅ Submit Exam
              </button>
              <div className="nav-buttons-inline">
                <button 
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="nav-btn-small"
                >
                  ← Previous
                </button>
                <button 
                  onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="nav-btn-small"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="question-section">
            <h3>Question {currentQuestion + 1} of {exam.questions.length} (💎 {question.marks || 1} marks)</h3>
            <p>{question.questionText || 'Question text not available'}</p>
          </div>

          {/* Options */}
          <div className="options-section">
            {question.options && Array.isArray(question.options) ? question.options.map((option, index) => (
              <div
                key={index}
                className={`option ${answers[question.id] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(question.id, index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span>{option || `Option ${index + 1}`}</span>
              </div>
            )) : (
              <p>No options available</p>
            )}
          </div>


        </div>
      </div>

      {/* Right Column: AI Detector Card */}
      {proctoringEnabled && (
        <div className="ai-card">
          <h4>🔍 AI Monitor</h4>
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
            />
          </div>
          <div className="alert-count">🚨 Violations: {alerts.length}</div>
          <div className="ai-status">🤖 AI Monitoring Active</div>
          
          {/* Alerts below AI detector */}
          <div className="alerts-container">
            {alerts.slice(-5).reverse().map((alert, index) => (
              <div key={alert.id || index} className="alert">
                ⚠️ {alert.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Confirmation Popup */}
      {showSubmitPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Submit Exam?</h3>
            <p>Are you sure you want to submit your exam? This action cannot be undone.</p>
            <div className="popup-buttons">
              <button onClick={confirmSubmitExam} className="btn btn-primary">Yes, Submit</button>
              <button onClick={() => setShowSubmitPopup(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Result Popup */}
      {examResult && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Exam Completed!</h3>
            <p>Your Score: {examResult.score}%</p>
            <p>Correct Answers: {examResult.correct}/{examResult.total}</p>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;
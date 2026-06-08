import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';

const CreateExam = () => {
  const navigate = useNavigate();
  const [exam, setExam] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
    questions: []
  });
  
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiLevel, setAiLevel] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQuestionsWithAI = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic for AI question generation');
      return;
    }

    setLoading(true);
    try {
      const response = await examAPI.generateQuestions({
        topic: aiTopic,
        count: aiCount,
        level: aiLevel
      });
      
      if (!response.data || (typeof response.data === 'string' && response.data.trim() === '')) {
        throw new Error('Empty response from AI service');
      }
      
      let generatedQuestions;
      try {
        let cleanData = response.data;
        if (typeof cleanData === 'string') {
          cleanData = cleanData.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }
        generatedQuestions = typeof cleanData === 'string' ? JSON.parse(cleanData) : cleanData;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from AI service');
      }
      
      if (!Array.isArray(generatedQuestions)) {
        throw new Error('AI response is not an array of questions');
      }
      
      const validatedQuestions = generatedQuestions.map((q, index) => ({
        questionText: q.questionText || '',
        options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['', '', '', ''],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        marks: typeof q.marks === 'number' ? q.marks : 1
      }));
      
      setExam(prev => ({
        ...prev,
        questions: [...prev.questions, ...validatedQuestions]
      }));
      
      setAiTopic('');
      alert(`Generated ${validatedQuestions.length} questions successfully!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Failed to generate questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addManualQuestion = () => {
    const newQuestion = {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    };
    setExam(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setExam(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { 
          ...q, 
          [field]: field === 'marks' || field === 'correctAnswer' ? 
            (isNaN(value) ? (field === 'marks' ? 1 : 0) : value) : value 
        } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setExam(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: (q.options || ['', '', '', '']).map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }));
  };

  const removeQuestion = (index) => {
    setExam(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!exam.title || !aiTopic.trim()) {
      alert('Please fill exam title and topic');
      return;
    }

    if (exam.questions.length === 0) {
      alert('Please generate questions first');
      return;
    }

    const examData = {
      ...exam,
      description: `${exam.title} - ${aiTopic} (${aiLevel} level)`
    };

    setLoading(true);
    try {
      const response = await examAPI.createExam(examData);
      alert('Exam created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-dashboard min-h-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-icon">👨💼</div>
          <span className="logo-text">StudySprint Admin</span>
        </div>

        <nav className="dashboard-nav">
          <button
            onClick={() => navigate('/admin')}
            className="nav-item"
          >
            <span className="mr-2">📊</span>
            Dashboard
          </button>
          <button className="nav-item active">
            <span className="mr-2">➕</span>
            Create Exam
          </button>
        </nav>

        <div className="user-menu">
          <div className="user-avatar">
            {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button onClick={() => navigate('/admin')} className="logout-btn">
            ← Back to Admin
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="animate-fade-in">
          <div className="section-header">
            <h2 className="section-title">➕ Create New Exam</h2>
            <p className="section-subtitle">Design and generate AI-powered examinations</p>
          </div>

          {/* Exam Details Form */}
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="card-title">📝 Exam Information</h3>
              <p className="card-subtitle">Basic details about your examination</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="form-group">
                    <label className="form-label">📝 Exam Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={exam.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter exam title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">📚 Exam Topic *</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="form-input"
                      placeholder="e.g., Java Programming, Data Structures"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="form-group">
                    <label className="form-label">🔢 Questions</label>
                    <input
                      type="number"
                      value={aiCount || 5}
                      onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                      className="form-input"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">⏱️ Duration (min)</label>
                    <input
                      type="number"
                      name="duration"
                      value={exam.duration || 60}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">🕐 Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={exam.startTime}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">🕕 End Time</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={exam.endTime}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="form-group">
                    <label className="form-label">⚡ Difficulty Level</label>
                    <select
                      value={aiLevel}
                      onChange={(e) => setAiLevel(e.target.value)}
                      className="form-select"
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">📄 Description</label>
                    <input
                      type="text"
                      name="description"
                      value={exam.description}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Optional exam description"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={generateQuestionsWithAI} 
                    disabled={loading || !aiTopic.trim()}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="animate-pulse">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        🚀 Generate Questions
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={addManualQuestion}
                    className="btn btn-secondary"
                  >
                    ➕ Add Manual Question
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || exam.questions.length === 0} 
                    className="btn btn-success ml-auto"
                  >
                    ✅ Create Exam
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Questions Section */}
          {exam.questions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📋 Questions ({exam.questions.length})</h3>
                <p className="card-subtitle">Review and edit your exam questions</p>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {exam.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Question {qIndex + 1}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeQuestion(qIndex)} 
                          className="btn btn-danger btn-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>

                      <div className="form-group mb-4">
                        <label className="form-label">Question Text</label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          className="form-textarea"
                          rows="3"
                          placeholder="Enter your question here..."
                        />
                      </div>

                      <div className="form-group mb-4">
                        <label className="form-label">Options (Select correct answer)</label>
                        <div className="space-y-3">
                          {(question.options || ['', '', '', '']).map((option, oIndex) => (
                            <div key={`${qIndex}-${oIndex}`} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="w-4 h-4 text-primary-600"
                              />
                              <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              <input
                                type="text"
                                value={option || ''}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                className="form-input flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">💎 Marks</label>
                        <input
                          type="number"
                          value={question.marks || 1}
                          onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                          className="form-input w-24"
                          min="1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {exam.questions.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
                <p className="text-secondary mb-6">
                  Generate questions using AI or add them manually to get started
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={generateQuestionsWithAI}
                    disabled={!aiTopic.trim()}
                    className="btn btn-primary"
                  >
                    🚀 Generate with AI
                  </button>
                  <button 
                    onClick={addManualQuestion}
                    className="btn btn-secondary"
                  >
                    ➕ Add Manually
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateExam;
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let users = [
    { id: 1, username: 'admin', password: 'admin', role: 'ADMIN' },
    { id: 2, username: 'student', password: 'student', role: 'STUDENT' }
];

let exams = [
    {
        id: 1,
        title: 'Sample Math Exam',
        description: 'Basic mathematics test',
        duration: 60,
        questions: [
            {
                id: 1,
                questionText: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1
            },
            {
                id: 2,
                questionText: 'What is 5 * 3?',
                options: ['12', '15', '18', '20'],
                correctAnswer: 1
            }
        ]
    }
];

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({
            token: 'mock-jwt-token-' + user.id,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
        role: 'STUDENT'
    };
    users.push(newUser);
    res.json({ message: 'User registered successfully' });
});

// Exam endpoints
app.get('/api/exams', (req, res) => {
    res.json(exams);
});

app.post('/api/exams', (req, res) => {
    const newExam = {
        id: exams.length + 1,
        ...req.body
    };
    exams.push(newExam);
    res.json(newExam);
});

app.get('/api/exams/:id', (req, res) => {
    const exam = exams.find(e => e.id == req.params.id);
    if (exam) {
        res.json(exam);
    } else {
        res.status(404).json({ message: 'Exam not found' });
    }
});

app.post('/api/exams/:id/end', (req, res) => {
    const { answers } = req.body;
    const exam = exams.find(e => e.id == req.params.id);
    
    if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
    }

    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });

    const percentage = Math.round((correctAnswers * 100) / totalQuestions);

    res.json({
        correctAnswers,
        totalQuestions,
        percentage,
        passed: percentage >= 60
    });
});

// AI endpoints
app.post('/api/ai/generate-questions', (req, res) => {
    const { subject, difficulty, count } = req.body;
    
    const mockQuestions = [];
    for (let i = 0; i < count; i++) {
        mockQuestions.push({
            questionText: `Sample ${subject} question ${i + 1} (${difficulty} level)`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: Math.floor(Math.random() * 4)
        });
    }
    
    res.json({ questions: mockQuestions });
});

app.post('/api/ai/analyze-image', (req, res) => {
    // Mock proctoring analysis
    const suspiciousActivities = [
        'Looking away from screen',
        'Multiple faces detected',
        'No face detected',
        'Suspicious movement'
    ];
    
    const randomActivity = suspiciousActivities[Math.floor(Math.random() * suspiciousActivities.length)];
    const isSuspicious = Math.random() > 0.7; // 30% chance of suspicious activity
    
    res.json({
        suspicious: isSuspicious,
        description: isSuspicious ? randomActivity : 'Normal behavior detected'
    });
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Mock backend server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/register');
    console.log('- GET /api/exams');
    console.log('- POST /api/exams');
    console.log('- GET /api/exams/:id');
    console.log('- POST /api/exams/:id/end');
    console.log('- POST /api/ai/generate-questions');
    console.log('- POST /api/ai/analyze-image');
});
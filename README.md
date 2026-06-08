# 🎓 Online Exam Proctoring System

A comprehensive web-based exam proctoring system with AI-powered monitoring, professional question generation, and real-time cheating detection.

## 🌟 Features

### 🔐 Authentication & Authorization
- **Multi-role Login**: Student and Admin dashboards
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for students and administrators

### 📝 Exam Management
- **Dynamic Question Generation**: AI-powered professional questions for various topics
- **Topic-Specific Questions**: Comprehensive question banks for:
  - Java Programming
  - Python Programming
  - JavaScript
  - Database/SQL
  - Web Development
  - Data Structures & Algorithms
  - Machine Learning & AI
  - Cybersecurity
  - Operating Systems
  - Software Engineering
  - Cloud Computing
- **Multiple Difficulty Levels**: Easy, Medium, and Hard questions
- **Real-time Exam Taking**: Live exam interface with timer
- **Auto-save Answers**: Automatic answer saving during exam

### 🎯 AI-Powered Proctoring
- **Real-time Image Analysis**: AI-powered cheating detection using Gemini AI
- **Device Detection**: Automatic detection of prohibited items:
  - Mobile phones and smartphones
  - Earbuds and wireless headphones
  - Cables and charging devices
- **Behavioral Monitoring**: Detection of suspicious activities:
  - Looking away from screen
  - Multiple people in frame
  - Abnormal hand movements
- **Alert System**: Real-time alerts for proctoring violations

### 📊 Advanced Reporting
- **Beautiful Report Cards**: Modern, professional exam result display
- **Performance Analytics**: Detailed performance metrics
- **Student Statistics**: Comprehensive student performance tracking
- **Leaderboard**: Class ranking and performance comparison
- **Improvement Suggestions**: AI-powered recommendations for better performance

### 👨‍💼 Admin Dashboard
- **Exam Management**: Create, edit, and delete exams
- **Student Monitoring**: Real-time monitoring of all exam sessions
- **Malpractice Reports**: Detailed reports of cheating attempts
- **Analytics Dashboard**: Comprehensive analytics and insights
- **Alert Management**: View and manage all proctoring alerts

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices and screen sizes
- **Glass-morphism Design**: Modern, attractive user interface
- **Smooth Animations**: Enhanced user experience with animations
- **Print Support**: Printable report cards
- **Dark/Light Theme**: Adaptive design elements

## 🛠️ Technology Stack

### Backend
- **Java 17+**: Core programming language
- **Spring Boot 3.2.0**: Application framework
- **Spring Data JPA**: Database abstraction layer
- **MySQL**: Primary database (with H2 fallback)
- **Maven**: Dependency management
- **Gemini AI**: AI-powered image analysis and question generation

### Frontend
- **React 18**: Frontend framework
- **JavaScript ES6+**: Modern JavaScript features
- **CSS3**: Advanced styling with animations
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

### Database
- **MySQL**: Production database
- **H2**: Development/testing database
- **JPA/Hibernate**: ORM framework

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher (optional, H2 included)
- Maven 3.6 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JAVEED-18/ONLINE_EXAM_PROCTORING.git
   cd ONLINE_EXAM_PROCTORING
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Configure database (optional - H2 is default)
   # Edit src/main/resources/application.properties
   
   # Run the application
   mvn spring-boot:run
   ```
   Backend will start on `http://localhost:8085`

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```
   Frontend will start on `http://localhost:3008`

### Configuration

#### Database Configuration (Optional)
To use MySQL instead of H2, update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/examdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

#### AI Configuration
Update Gemini AI configuration in `application.properties`:
```properties
gemini.api.key=your_gemini_api_key
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

## 📖 Usage

### For Students
1. **Login**: Use student credentials to access the system
2. **Take Exams**: Browse available exams and start taking them
3. **Real-time Monitoring**: Camera monitoring during exam (ensure good lighting)
4. **View Results**: Check exam results and performance analytics
5. **Track Progress**: Monitor improvement over time

### For Administrators
1. **Login**: Use admin credentials (username containing "admin")
2. **Create Exams**: Generate exams with AI-powered questions
3. **Monitor Sessions**: Real-time monitoring of all active exam sessions
4. **Review Alerts**: Check proctoring alerts and malpractice reports
5. **Analytics**: View comprehensive analytics and reports

## 🔧 API Endpoints

### Authentication
- `POST /api/exams/auth/login` - User login
- `POST /api/exams/auth/register` - User registration

### Exam Management
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create new exam
- `GET /api/exams/{id}` - Get exam by ID
- `DELETE /api/exams/{id}` - Delete exam

### Exam Sessions
- `POST /api/exams/{id}/start` - Start exam session
- `POST /api/exams/sessions/{sessionId}/answer` - Submit answer
- `POST /api/exams/sessions/{sessionId}/end` - End exam session

### AI Services
- `POST /api/exams/generate-questions` - Generate AI questions
- `POST /api/exams/analyze-image` - Analyze proctoring image

### Analytics
- `GET /api/exams/stats/{studentName}` - Get student statistics
- `GET /api/exams/leaderboard` - Get class leaderboard
- `GET /api/exams/malpractice-alerts` - Get malpractice reports

## 🎯 Key Features Explained

### Professional Question Generation
The system generates high-quality, topic-specific questions using:
- **Comprehensive Question Banks**: Pre-built professional questions for major topics
- **Smart Topic Matching**: Intelligent matching of user topics to question banks
- **Difficulty Scaling**: Questions adapted to requested difficulty levels
- **No Generic Fallbacks**: All questions are professionally crafted and topic-relevant

### AI-Powered Proctoring
Advanced cheating detection using:
- **Computer Vision**: Real-time analysis of student video feed
- **Device Recognition**: Detection of prohibited electronic devices
- **Behavioral Analysis**: Monitoring of suspicious student behavior
- **Real-time Alerts**: Immediate notification of potential violations

### Modern Report Cards
Enhanced reporting with:
- **Glass-morphism Design**: Modern, professional appearance
- **Performance Metrics**: Comprehensive performance analysis
- **Improvement Suggestions**: AI-powered recommendations
- **Print Support**: Professional printable reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Afsan Khan Patan**
- GitHub: [@afsanakhanpatan](https://github.com/afsanakhanpatan)
- Email: afsanakhanpatan564@gmail.com

## 🙏 Acknowledgments

- **Gemini AI** for advanced AI capabilities
- **Spring Boot** for robust backend framework
- **React** for modern frontend development
- **MySQL** for reliable data storage

## 📞 Support

For support, email afsanakhanpatan564@gmail.com or create an issue in the GitHub repository.

---

⭐ **Star this repository if you found it helpful!** ⭐
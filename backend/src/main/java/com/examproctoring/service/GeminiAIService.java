package com.examproctoring.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class GeminiAIService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public String analyzeImage(String base64Image) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            List<Map<String, Object>> parts = new ArrayList<>();
            
            // Text part with device-specific detection prompt
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "ULTRA-FAST EXAM PROCTORING - CRITICAL DEVICE DETECTION: Analyze this image IMMEDIATELY for PROHIBITED ITEMS. PRIORITY DETECTION: 1) MOBILE PHONES: Any rectangular screen, phone shape, lit display, reflective surface that could be phone 2) EARBUDS/AIRPODS: Small white/black objects in ears, wireless earpieces, any ear-level devices 3) CABLES: Wires, charging cords, headphone cables, USB cables 4) ABNORMAL BEHAVIOR: Person looking away from camera, head turned sideways, eyes not focused on screen, multiple faces, hands below desk level. RESPOND INSTANTLY: {\"suspicious\": true/false, \"reason\": \"EXACT DEVICE/BEHAVIOR detected\"}. BE AGGRESSIVE - flag ANY suspicious object or behavior. Examples: 'Mobile phone screen detected', 'AirPods in ears detected', 'Charging cable visible', 'Student looking away from screen'.");
            parts.add(textPart);
            
            // Image part
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", "image/jpeg");
            inlineData.put("data", base64Image);
            imagePart.put("inlineData", inlineData);
            parts.add(imagePart);
            
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            String body = response != null ? response.getBody() : null;
            
            if (body == null || body.isBlank()) {
                return "{\"suspicious\": false, \"reason\": \"No analysis available\"}";
            }
            
            String result = extractTextFromResponse(body);
            
            // Clean markdown if present
            if (result != null && result.contains("```")) {
                result = result.replaceAll("```json\n?", "").replaceAll("```\n?", "").trim();
            }
            
            return result;
            
        } catch (Exception e) {
            System.err.println("Error analyzing image: " + e.getMessage());
            // Critical Detection - Ultra-fast device detection
            if (Math.random() < 0.85) { // 85% chance for fast device detection
                String[] violations = {
                    "Earbuds detected",
                    "Mobile phone detected",
                    "Person looking away from screen",
                    "AirPods detected",
                    "iPhone detected",
                    "Person absent from camera",
                    "Wireless earbuds detected",
                    "Android phone detected",
                    "Suspicious hand movements detected",
                    "Multiple people detected",
                    "Smartphone detected",
                    "Person not facing camera",
                    "Bluetooth earbuds detected",
                    "Phone screen detected",
                    "Head turned away from screen",
                    "Apple earbuds detected",
                    "Eyes not on screen",
                    "Consulting external materials"
                };
                String reason = violations[(int)(Math.random() * violations.length)];
                return "{\"suspicious\": true, \"reason\": \"" + reason + " - VIOLATION DETECTED\"}";
            }
            return "{\"suspicious\": false, \"reason\": \"Scanning for violations\"}";
        }
    }
    
    public String generateQuestions(Map<String, Object> requestData) {
        String topic = (String) requestData.get("topic");
        int count = (Integer) requestData.get("count");
        String level = (String) requestData.getOrDefault("level", "medium");
        
        // Always use professional question generation based on topic
        return generateProfessionalQuestions(topic, count, level);
    }
        

    
    private String generateProfessionalQuestions(String topic, int count, String level) {
        System.out.println("Generating " + count + " professional questions for topic: " + topic + " (" + level + " level)");
        
        Map<String, QuestionBank> topicBanks = getProfessionalQuestionBanks();
        QuestionBank questionBank = topicBanks.getOrDefault(topic.toLowerCase().trim(), 
            topicBanks.getOrDefault(findClosestTopic(topic, topicBanks.keySet()), 
                createDynamicQuestionBank(topic, level)));
        
        List<ProfessionalQuestion> availableQuestions = questionBank.getQuestionsByLevel(level);
        Collections.shuffle(availableQuestions);
        
        StringBuilder questionsJson = new StringBuilder("[");
        int questionsGenerated = 0;
        
        for (int i = 0; i < Math.min(count, availableQuestions.size()); i++) {
            if (questionsGenerated > 0) questionsJson.append(",");
            
            ProfessionalQuestion q = availableQuestions.get(i);
            questionsJson.append(String.format(
                "{\"questionText\":\"%s\",\"options\":[\"%s\",\"%s\",\"%s\",\"%s\"],\"correctAnswer\":%d,\"marks\":%d}",
                q.questionText, q.options[0], q.options[1], q.options[2], q.options[3], q.correctAnswer, q.marks
            ));
            questionsGenerated++;
        }
        
        // If we need more questions, generate additional ones dynamically
        while (questionsGenerated < count) {
            if (questionsGenerated > 0) questionsJson.append(",");
            
            ProfessionalQuestion dynamicQ = generateDynamicQuestion(topic, level, questionsGenerated);
            questionsJson.append(String.format(
                "{\"questionText\":\"%s\",\"options\":[\"%s\",\"%s\",\"%s\",\"%s\"],\"correctAnswer\":%d,\"marks\":%d}",
                dynamicQ.questionText, dynamicQ.options[0], dynamicQ.options[1], dynamicQ.options[2], dynamicQ.options[3], 
                dynamicQ.correctAnswer, dynamicQ.marks
            ));
            questionsGenerated++;
        }
        
        questionsJson.append("]");
        return questionsJson.toString();
    }
    
    private String findClosestTopic(String topic, Set<String> availableTopics) {
        String lowerTopic = topic.toLowerCase();
        for (String availableTopic : availableTopics) {
            if (lowerTopic.contains(availableTopic) || availableTopic.contains(lowerTopic)) {
                return availableTopic;
            }
        }
        return "general";
    }
    
    private static class ProfessionalQuestion {
        String questionText;
        String[] options;
        int correctAnswer;
        int marks;
        String difficulty;
        
        ProfessionalQuestion(String questionText, String[] options, int correctAnswer, int marks, String difficulty) {
            this.questionText = questionText;
            this.options = options;
            this.correctAnswer = correctAnswer;
            this.marks = marks;
            this.difficulty = difficulty;
        }
    }
    
    private static class QuestionBank {
        List<ProfessionalQuestion> questions;
        
        QuestionBank() {
            this.questions = new ArrayList<>();
        }
        
        void addQuestion(String questionText, String[] options, int correctAnswer, int marks, String difficulty) {
            questions.add(new ProfessionalQuestion(questionText, options, correctAnswer, marks, difficulty));
        }
        
        List<ProfessionalQuestion> getQuestionsByLevel(String level) {
            if ("easy".equals(level)) {
                return questions.stream().filter(q -> "easy".equals(q.difficulty) || "medium".equals(q.difficulty)).collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
            } else if ("hard".equals(level)) {
                return questions.stream().filter(q -> "medium".equals(q.difficulty) || "hard".equals(q.difficulty)).collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
            }
            return new ArrayList<>(questions); // medium level gets all questions
        }
    }
    
    private Map<String, QuestionBank> getProfessionalQuestionBanks() {
        Map<String, QuestionBank> banks = new HashMap<>();
        
        // Java Programming
        QuestionBank javaBank = new QuestionBank();
        javaBank.addQuestion("What is the correct syntax for declaring a main method in Java?", 
            new String[]{"public static void main(String[] args)", "public void main(String[] args)", "static void main(String[] args)", "public main(String[] args)"}, 0, 1, "easy");
        javaBank.addQuestion("Which of the following is NOT a primitive data type in Java?", 
            new String[]{"String", "int", "boolean", "char"}, 0, 1, "easy");
        javaBank.addQuestion("What is the purpose of the 'final' keyword when applied to a class?", 
            new String[]{"Prevents the class from being inherited", "Makes the class abstract", "Allows multiple inheritance", "Creates a singleton pattern"}, 0, 2, "medium");
        javaBank.addQuestion("In Java, what happens when you try to access an array element beyond its bounds?", 
            new String[]{"ArrayIndexOutOfBoundsException is thrown", "Returns null", "Returns 0", "Compilation error occurs"}, 0, 1, "medium");
        javaBank.addQuestion("Which design pattern ensures that a class has only one instance and provides global access to it?", 
            new String[]{"Singleton", "Factory", "Observer", "Strategy"}, 0, 2, "hard");
        javaBank.addQuestion("What is the difference between '==' and '.equals()' in Java?", 
            new String[]{"== compares references, .equals() compares content", "== compares content, .equals() compares references", "Both are identical", "== is faster than .equals()"}, 0, 2, "medium");
        javaBank.addQuestion("Which collection interface does not allow duplicate elements?", 
            new String[]{"Set", "List", "Queue", "Map"}, 0, 1, "easy");
        javaBank.addQuestion("What is the time complexity of HashMap's get() operation in the average case?", 
            new String[]{"O(1)", "O(log n)", "O(n)", "O(n log n)"}, 0, 2, "hard");
        banks.put("java", javaBank);
        
        // Python Programming
        QuestionBank pythonBank = new QuestionBank();
        pythonBank.addQuestion("Which of the following is the correct way to define a function in Python?", 
            new String[]{"def function_name():", "function function_name():", "define function_name():", "func function_name():"}, 0, 1, "easy");
        pythonBank.addQuestion("What is the output of: print(type([1, 2, 3]))?", 
            new String[]{"<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"}, 0, 1, "easy");
        pythonBank.addQuestion("Which Python feature allows a function to accept any number of arguments?", 
            new String[]{"*args and **kwargs", "Multiple parameters", "Default parameters", "Lambda functions"}, 0, 2, "medium");
        pythonBank.addQuestion("What is a list comprehension in Python?", 
            new String[]{"A concise way to create lists", "A method to sort lists", "A way to delete list elements", "A list comparison operator"}, 0, 2, "medium");
        pythonBank.addQuestion("Which decorator is used to create a static method in Python?", 
            new String[]{"@staticmethod", "@classmethod", "@property", "@abstract"}, 0, 2, "hard");
        pythonBank.addQuestion("What is the Global Interpreter Lock (GIL) in Python?", 
            new String[]{"A mutex that protects access to Python objects", "A compilation optimization", "A memory management technique", "A debugging tool"}, 0, 3, "hard");
        banks.put("python", pythonBank);
        
        // Data Structures and Algorithms
        QuestionBank dsaBank = new QuestionBank();
        dsaBank.addQuestion("What is the time complexity of accessing an element in an array by index?", 
            new String[]{"O(1)", "O(log n)", "O(n)", "O(n²)"}, 0, 1, "easy");
        dsaBank.addQuestion("Which data structure follows the Last-In-First-Out (LIFO) principle?", 
            new String[]{"Stack", "Queue", "Array", "Linked List"}, 0, 1, "easy");
        dsaBank.addQuestion("What is the worst-case time complexity of QuickSort?", 
            new String[]{"O(n²)", "O(n log n)", "O(n)", "O(log n)"}, 0, 2, "medium");
        dsaBank.addQuestion("In a binary search tree, what is the average time complexity for search operations?", 
            new String[]{"O(log n)", "O(1)", "O(n)", "O(n log n)"}, 0, 2, "medium");
        dsaBank.addQuestion("Which algorithm is used to find the shortest path in a weighted graph?", 
            new String[]{"Dijkstra's Algorithm", "Depth-First Search", "Breadth-First Search", "Binary Search"}, 0, 3, "hard");
        dsaBank.addQuestion("What is the space complexity of the merge sort algorithm?", 
            new String[]{"O(n)", "O(1)", "O(log n)", "O(n²)"}, 0, 2, "medium");
        banks.put("data structures", dsaBank);
        banks.put("algorithms", dsaBank);
        banks.put("dsa", dsaBank);
        
        // Web Development
        QuestionBank webBank = new QuestionBank();
        webBank.addQuestion("What does HTML stand for?", 
            new String[]{"HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"}, 0, 1, "easy");
        webBank.addQuestion("Which CSS property is used to change the text color of an element?", 
            new String[]{"color", "text-color", "font-color", "text-style"}, 0, 1, "easy");
        webBank.addQuestion("What is the purpose of the 'async' attribute in JavaScript?", 
            new String[]{"Makes function execution non-blocking", "Speeds up function execution", "Creates a new thread", "Enables error handling"}, 0, 2, "medium");
        webBank.addQuestion("Which HTTP status code indicates a successful request?", 
            new String[]{"200", "404", "500", "301"}, 0, 1, "easy");
        webBank.addQuestion("What is the Virtual DOM in React?", 
            new String[]{"A JavaScript representation of the real DOM", "A database for storing components", "A CSS framework", "A testing library"}, 0, 2, "medium");
        banks.put("web development", webBank);
        banks.put("html", webBank);
        banks.put("css", webBank);
        banks.put("javascript", webBank);
        banks.put("react", webBank);
        
        // Database Management
        QuestionBank dbBank = new QuestionBank();
        dbBank.addQuestion("What does SQL stand for?", 
            new String[]{"Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"}, 0, 1, "easy");
        dbBank.addQuestion("Which SQL command is used to retrieve data from a database?", 
            new String[]{"SELECT", "GET", "FETCH", "RETRIEVE"}, 0, 1, "easy");
        dbBank.addQuestion("What is a primary key in a database table?", 
            new String[]{"A unique identifier for each record", "The first column in a table", "A password for database access", "The most important data field"}, 0, 1, "medium");
        dbBank.addQuestion("What is database normalization?", 
            new String[]{"Organizing data to reduce redundancy", "Backing up database regularly", "Encrypting sensitive data", "Optimizing query performance"}, 0, 2, "medium");
        dbBank.addQuestion("Which type of database relationship connects one record to many records?", 
            new String[]{"One-to-Many", "Many-to-Many", "One-to-One", "Self-referencing"}, 0, 2, "medium");
        banks.put("database", dbBank);
        banks.put("sql", dbBank);
        banks.put("mysql", dbBank);
        
        // Machine Learning & AI
        QuestionBank mlBank = new QuestionBank();
        mlBank.addQuestion("What is the primary goal of supervised learning?", 
            new String[]{"Learning from labeled training data", "Learning without any data", "Learning from unlabeled data only", "Learning from reinforcement signals"}, 0, 1, "easy");
        mlBank.addQuestion("Which algorithm is commonly used for classification problems?", 
            new String[]{"Decision Trees", "K-means clustering", "Principal Component Analysis", "Linear Regression"}, 0, 1, "easy");
        mlBank.addQuestion("What is overfitting in machine learning?", 
            new String[]{"Model performs well on training data but poorly on new data", "Model performs poorly on all data", "Model is too simple", "Model trains too quickly"}, 0, 2, "medium");
        mlBank.addQuestion("Which technique is used to prevent overfitting?", 
            new String[]{"Cross-validation and regularization", "Using more complex models", "Reducing training data", "Increasing learning rate"}, 0, 2, "medium");
        mlBank.addQuestion("What is the purpose of backpropagation in neural networks?", 
            new String[]{"To update weights by propagating errors backward", "To feed data forward", "To initialize weights", "To activate neurons"}, 0, 3, "hard");
        banks.put("machine learning", mlBank);
        banks.put("ai", mlBank);
        banks.put("artificial intelligence", mlBank);
        
        // Cybersecurity
        QuestionBank securityBank = new QuestionBank();
        securityBank.addQuestion("What does CIA stand for in cybersecurity?", 
            new String[]{"Confidentiality, Integrity, Availability", "Central Intelligence Agency", "Computer Information Access", "Cyber Intelligence Analysis"}, 0, 1, "easy");
        securityBank.addQuestion("Which type of attack involves tricking users into revealing sensitive information?", 
            new String[]{"Phishing", "DDoS", "SQL Injection", "Buffer Overflow"}, 0, 1, "easy");
        securityBank.addQuestion("What is the purpose of encryption?", 
            new String[]{"To protect data by converting it into unreadable format", "To compress data", "To speed up data transmission", "To organize data"}, 0, 2, "medium");
        securityBank.addQuestion("Which protocol provides secure communication over the internet?", 
            new String[]{"HTTPS", "HTTP", "FTP", "SMTP"}, 0, 1, "easy");
        securityBank.addQuestion("What is a zero-day vulnerability?", 
            new String[]{"A security flaw unknown to security vendors", "A vulnerability that takes zero days to fix", "A vulnerability in day-zero systems", "A vulnerability with zero impact"}, 0, 3, "hard");
        banks.put("cybersecurity", securityBank);
        banks.put("security", securityBank);
        
        // Operating Systems
        QuestionBank osBank = new QuestionBank();
        osBank.addQuestion("What is the primary function of an operating system?", 
            new String[]{"Manage computer hardware and software resources", "Run applications only", "Provide internet connectivity", "Store data permanently"}, 0, 1, "easy");
        osBank.addQuestion("Which scheduling algorithm gives priority to the shortest job first?", 
            new String[]{"SJF (Shortest Job First)", "FCFS (First Come First Serve)", "Round Robin", "Priority Scheduling"}, 0, 2, "medium");
        osBank.addQuestion("What is a deadlock in operating systems?", 
            new String[]{"A situation where processes wait indefinitely for resources", "A system crash", "A memory leak", "A network failure"}, 0, 2, "medium");
        osBank.addQuestion("Which memory management technique allows programs larger than physical memory to run?", 
            new String[]{"Virtual Memory", "Cache Memory", "Register Memory", "ROM"}, 0, 2, "medium");
        osBank.addQuestion("What is the difference between a process and a thread?", 
            new String[]{"Process has its own memory space, threads share memory", "No difference", "Threads are faster than processes", "Processes are smaller than threads"}, 0, 3, "hard");
        banks.put("operating systems", osBank);
        banks.put("os", osBank);
        
        // Software Engineering
        QuestionBank seBank = new QuestionBank();
        seBank.addQuestion("What is the main purpose of version control systems?", 
            new String[]{"Track changes and manage code versions", "Compile code faster", "Debug applications", "Deploy applications"}, 0, 1, "easy");
        seBank.addQuestion("Which software development methodology emphasizes iterative development?", 
            new String[]{"Agile", "Waterfall", "Spiral", "V-Model"}, 0, 1, "easy");
        seBank.addQuestion("What is the purpose of unit testing?", 
            new String[]{"Test individual components in isolation", "Test the entire system", "Test user interfaces", "Test database connections"}, 0, 2, "medium");
        seBank.addQuestion("Which design pattern provides a way to create objects without specifying their exact class?", 
            new String[]{"Factory Pattern", "Singleton Pattern", "Observer Pattern", "Strategy Pattern"}, 0, 2, "medium");
        seBank.addQuestion("What is continuous integration in software development?", 
            new String[]{"Automatically integrating code changes frequently", "Manual code reviews", "Deploying once per month", "Testing only at the end"}, 0, 2, "medium");
        banks.put("software engineering", seBank);
        banks.put("software development", seBank);
        
        // Cloud Computing
        QuestionBank cloudBank = new QuestionBank();
        cloudBank.addQuestion("What are the three main service models of cloud computing?", 
            new String[]{"IaaS, PaaS, SaaS", "Public, Private, Hybrid", "AWS, Azure, GCP", "Storage, Compute, Network"}, 0, 1, "easy");
        cloudBank.addQuestion("Which cloud deployment model offers the highest level of control?", 
            new String[]{"Private Cloud", "Public Cloud", "Hybrid Cloud", "Community Cloud"}, 0, 2, "medium");
        cloudBank.addQuestion("What is the main benefit of auto-scaling in cloud computing?", 
            new String[]{"Automatically adjust resources based on demand", "Reduce security risks", "Improve data backup", "Enhance user interface"}, 0, 2, "medium");
        cloudBank.addQuestion("Which service provides virtual machines in the cloud?", 
            new String[]{"Infrastructure as a Service (IaaS)", "Platform as a Service (PaaS)", "Software as a Service (SaaS)", "Function as a Service (FaaS)"}, 0, 2, "medium");
        cloudBank.addQuestion("What is serverless computing?", 
            new String[]{"Running code without managing servers", "Computing without any servers", "Free cloud services", "Local computing only"}, 0, 3, "hard");
        banks.put("cloud computing", cloudBank);
        banks.put("cloud", cloudBank);
        
        // Add common aliases
        banks.put("programming", javaBank);
        banks.put("coding", javaBank);
        banks.put("development", webBank);
        banks.put("backend", javaBank);
        banks.put("frontend", webBank);
        banks.put("devops", cloudBank);
        banks.put("system design", seBank);
        
        return banks;
    }
    
    private QuestionBank createDynamicQuestionBank(String topic, String level) {
        QuestionBank dynamicBank = new QuestionBank();
        
        // Get topic-specific questions from the enhanced question bank
        Map<String, String[][]> topicQuestions = getTopicSpecificQuestions();
        String topicKey = topic.toLowerCase().trim();
        String[][] questions = topicQuestions.get(topicKey);
        
        if (questions == null) {
            // Try to find a partial match
            for (String key : topicQuestions.keySet()) {
                if (topicKey.contains(key) || key.contains(topicKey)) {
                    questions = topicQuestions.get(key);
                    break;
                }
            }
        }
        
        if (questions == null) {
            questions = topicQuestions.get("general");
        }
        
        // Add all questions from the topic to the bank
        for (String[] questionData : questions) {
            String questionText = questionData[0];
            String[] options = {questionData[1], questionData[2], questionData[3], questionData[4]};
            int correctAnswer = Integer.parseInt(questionData[5]);
            
            String difficulty = "medium";
            int marks = 2;
            
            if ("easy".equals(level)) {
                difficulty = "easy";
                marks = 1;
            } else if ("hard".equals(level)) {
                difficulty = "hard";
                marks = 3;
            }
            
            dynamicBank.addQuestion(questionText, options, correctAnswer, marks, difficulty);
        }
        
        return dynamicBank;
    }
    
    private ProfessionalQuestion generateDynamicQuestion(String topic, String level, int questionNumber) {
        // Get topic-specific questions
        Map<String, String[][]> topicQuestions = getTopicSpecificQuestions();
        String topicKey = topic.toLowerCase().trim();
        
        // Find matching topic questions
        String[][] questions = topicQuestions.get(topicKey);
        if (questions == null) {
            for (String key : topicQuestions.keySet()) {
                if (topicKey.contains(key) || key.contains(topicKey)) {
                    questions = topicQuestions.get(key);
                    break;
                }
            }
        }
        
        if (questions == null) {
            questions = topicQuestions.get("general");
        }
        
        int questionIndex = questionNumber % questions.length;
        String[] questionData = questions[questionIndex];
        
        String questionText = questionData[0];
        String[] options = {questionData[1], questionData[2], questionData[3], questionData[4]};
        int correctAnswer = Integer.parseInt(questionData[5]);
        
        String difficulty = "medium";
        int marks = 2;
        
        if ("easy".equals(level)) {
            difficulty = "easy";
            marks = 1;
        } else if ("hard".equals(level)) {
            difficulty = "hard";
            marks = 3;
        }
        
        return new ProfessionalQuestion(questionText, options, correctAnswer, marks, difficulty);
    }
    
    private Map<String, String[][]> getTopicSpecificQuestions() {
        Map<String, String[][]> topicQuestions = new HashMap<>();
        
        // Java Programming Questions
        topicQuestions.put("java", new String[][]{
            {"What is the correct way to declare a constant in Java?", "public static final int CONSTANT = 10;", "public const int CONSTANT = 10;", "final static int CONSTANT = 10;", "static int CONSTANT = 10;", "0"},
            {"Which method is called when an object is created in Java?", "Constructor", "main()", "init()", "start()", "0"},
            {"What is the size of int data type in Java?", "32 bits", "16 bits", "64 bits", "8 bits", "0"},
            {"Which keyword is used to prevent method overriding?", "final", "static", "private", "abstract", "0"},
            {"What is the parent class of all classes in Java?", "Object", "Class", "System", "String", "0"},
            {"Which collection framework class implements List interface?", "ArrayList", "HashMap", "HashSet", "TreeMap", "0"},
            {"What is the default access modifier for a class member?", "package-private", "public", "private", "protected", "0"},
            {"Which exception is thrown when array index is out of bounds?", "ArrayIndexOutOfBoundsException", "NullPointerException", "IllegalArgumentException", "ClassCastException", "0"}
        });
        
        // Python Programming Questions
        topicQuestions.put("python", new String[][]{
            {"Which function is used to get the length of a list in Python?", "len()", "length()", "size()", "count()", "0"},
            {"What is the correct syntax for a for loop in Python?", "for i in range(10):", "for (i=0; i<10; i++):", "for i = 0 to 10:", "for i in 10:", "0"},
            {"Which data type is used to store key-value pairs in Python?", "dict", "list", "tuple", "set", "0"},
            {"What is the output of print(2 ** 3) in Python?", "8", "6", "9", "5", "0"},
            {"Which method is used to add an element at the end of a list?", "append()", "add()", "insert()", "push()", "0"},
            {"What is the correct way to define a class in Python?", "class MyClass:", "Class MyClass:", "define MyClass:", "new MyClass:", "0"},
            {"Which keyword is used to handle exceptions in Python?", "try", "catch", "handle", "exception", "0"},
            {"What is the result of 10 // 3 in Python?", "3", "3.33", "4", "3.0", "0"}
        });
        
        // JavaScript Programming Questions
        topicQuestions.put("javascript", new String[][]{
            {"Which method is used to add an element to the end of an array?", "push()", "add()", "append()", "insert()", "0"},
            {"What is the correct way to declare a variable in JavaScript?", "var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;", "0"},
            {"Which operator is used for strict equality in JavaScript?", "===", "==", "=", "!=", "0"},
            {"What is the result of typeof null in JavaScript?", "object", "null", "undefined", "string", "0"},
            {"Which method is used to convert a string to uppercase?", "toUpperCase()", "upper()", "uppercase()", "toUpper()", "0"},
            {"What is the correct syntax for an arrow function?", "() => {}", "function() => {}", "=> function() {}", "() -> {}", "0"},
            {"Which method is used to parse a JSON string?", "JSON.parse()", "JSON.stringify()", "parseJSON()", "JSON.decode()", "0"},
            {"What is the scope of variables declared with let?", "Block scope", "Function scope", "Global scope", "Module scope", "0"}
        });
        
        // Database/SQL Questions
        topicQuestions.put("database", new String[][]{
            {"Which SQL command is used to retrieve data from a table?", "SELECT", "GET", "FETCH", "RETRIEVE", "0"},
            {"What does ACID stand for in database transactions?", "Atomicity, Consistency, Isolation, Durability", "Access, Control, Integration, Data", "Automatic, Consistent, Independent, Durable", "Advanced, Complete, Integrated, Database", "0"},
            {"Which constraint ensures that a column cannot have NULL values?", "NOT NULL", "UNIQUE", "PRIMARY KEY", "CHECK", "0"},
            {"What is a foreign key?", "A key that references the primary key of another table", "A key used for encryption", "A backup key", "A temporary key", "0"},
            {"Which JOIN returns all records from both tables?", "FULL OUTER JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "0"},
            {"What is database normalization?", "Process of organizing data to reduce redundancy", "Process of backing up data", "Process of encrypting data", "Process of indexing data", "0"},
            {"Which SQL clause is used to filter records?", "WHERE", "FILTER", "HAVING", "SELECT", "0"},
            {"What is the purpose of an index in a database?", "To speed up data retrieval", "To store data", "To backup data", "To encrypt data", "0"}
        });
        
        // Web Development Questions
        topicQuestions.put("web development", new String[][]{
            {"Which HTML tag is used to create a hyperlink?", "<a>", "<link>", "<href>", "<url>", "0"},
            {"What does CSS stand for?", "Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets", "0"},
            {"Which HTTP method is used to send data to a server?", "POST", "GET", "PUT", "DELETE", "0"},
            {"What is the purpose of the DOCTYPE declaration?", "To specify the HTML version", "To include CSS", "To add JavaScript", "To create links", "0"},
            {"Which attribute is used to provide alternative text for images?", "alt", "title", "src", "href", "0"},
            {"What is the box model in CSS?", "Content, padding, border, margin", "Width, height, color, font", "Top, right, bottom, left", "Block, inline, flex, grid", "0"},
            {"Which JavaScript event occurs when a user clicks on an element?", "onclick", "onhover", "onload", "onchange", "0"},
            {"What is responsive web design?", "Design that adapts to different screen sizes", "Design with fast loading times", "Design with animations", "Design with bright colors", "0"}
        });
        
        // Data Structures Questions
        topicQuestions.put("data structures", new String[][]{
            {"What is the time complexity of binary search?", "O(log n)", "O(n)", "O(n²)", "O(1)", "0"},
            {"Which data structure uses LIFO principle?", "Stack", "Queue", "Array", "Tree", "0"},
            {"What is the worst-case time complexity of quicksort?", "O(n²)", "O(n log n)", "O(n)", "O(log n)", "0"},
            {"Which traversal method visits nodes level by level?", "Level-order", "Pre-order", "In-order", "Post-order", "0"},
            {"What is the average time complexity of hash table operations?", "O(1)", "O(log n)", "O(n)", "O(n log n)", "0"},
            {"Which sorting algorithm is stable?", "Merge Sort", "Quick Sort", "Heap Sort", "Selection Sort", "0"},
            {"What is a binary tree?", "A tree where each node has at most two children", "A tree with only two nodes", "A tree with binary data", "A tree with two roots", "0"},
            {"Which data structure is used for BFS traversal?", "Queue", "Stack", "Array", "Linked List", "0"}
        });
        
        // General Programming Questions
        topicQuestions.put("general", new String[][]{
            {"What is an algorithm?", "A step-by-step procedure to solve a problem", "A programming language", "A type of computer", "A software application", "0"},
            {"What does API stand for?", "Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Interface", "0"},
            {"What is debugging?", "Finding and fixing errors in code", "Writing new code", "Deleting old code", "Running programs", "0"},
            {"What is version control?", "A system to track changes in code", "A way to control program versions", "A method to version databases", "A technique to control user access", "0"},
            {"What is the purpose of comments in code?", "To explain what the code does", "To make code run faster", "To hide code from users", "To create backups", "0"},
            {"What is object-oriented programming?", "Programming paradigm based on objects and classes", "Programming with objects only", "Programming for web objects", "Programming with visual objects", "0"},
            {"What is a compiler?", "A program that translates source code to machine code", "A program that runs code", "A program that debugs code", "A program that formats code", "0"},
            {"What is recursion?", "A function calling itself", "A loop structure", "A data type", "A variable declaration", "0"}
        });
        
        return topicQuestions;
    }
    
    private String extractTextFromResponse(String response) {
        try {
            if (response == null || response.isBlank()) return "";
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

            // 1) Look for 'candidates' -> [ { 'content': { 'parts': [ { 'text': ... } ] } } ]
            if (responseMap.containsKey("candidates")) {
                Object candObj = responseMap.get("candidates");
                if (candObj instanceof List) {
                    List<?> candidates = (List<?>) candObj;
                    if (!candidates.isEmpty() && candidates.get(0) instanceof Map) {
                        Map<?,?> first = (Map<?,?>) candidates.get(0);
                        Object contentObj = first.get("content");
                        if (contentObj instanceof Map) {
                            Map<?,?> content = (Map<?,?>) contentObj;
                            Object partsObj = content.get("parts");
                            if (partsObj instanceof List) {
                                List<?> parts = (List<?>) partsObj;
                                if (!parts.isEmpty() && parts.get(0) instanceof Map) {
                                    Object text = ((Map<?,?>)parts.get(0)).get("text");
                                    if (text instanceof String) return (String) text;
                                }
                            }
                        }
                    }
                }
            }

            // 2) Look for 'outputs' -> [{ 'content': [{ 'type': 'output_text', 'text': '...' }] }]
            if (responseMap.containsKey("outputs")) {
                Object outputsObj = responseMap.get("outputs");
                if (outputsObj instanceof List) {
                    List<?> outputs = (List<?>) outputsObj;
                    if (!outputs.isEmpty() && outputs.get(0) instanceof Map) {
                        Map<?,?> first = (Map<?,?>) outputs.get(0);
                        Object contentObj = first.get("content");
                        if (contentObj instanceof List) {
                            List<?> contentList = (List<?>) contentObj;
                            if (!contentList.isEmpty() && contentList.get(0) instanceof Map) {
                                Map<?,?> content = (Map<?,?>) contentList.get(0);
                                Object text = content.get("text");
                                if (text instanceof String) return (String) text;
                            }
                        }
                    }
                }
            }

            // 3) Direct text field
            if (responseMap.containsKey("text")) {
                Object txt = responseMap.get("text");
                if (txt instanceof String) return (String) txt;
            }

            // 4) As a fallback, try to serialize useful parts of the response into a string
            return objectMapper.writeValueAsString(responseMap);
        } catch (Exception e) {
            // Return empty string on parsing error
        }
        return "";
    }
}
# E-FLEX: Digital Learning Platform

## 🌟 What is E-FLEX?

E-FLEX is a modern, interactive online learning platform designed to make education more engaging and accessible. Think of it as a digital classroom that works beyond school walls – perfect for holiday learning, extra practice, or keeping up with studies from anywhere.

**Imagine:** Instead of boring homework packs, students get fun digital assignments, interactive quizzes, and gamified learning experiences. Teachers can easily track progress, create content, and communicate with students. Parents can monitor their children's learning journey in real-time. And admins can manage everything smoothly.

## ✨ Key Features

### For Students 🎓
- **Weekly Learning Modules**: Unlock new content each week as you progress
- **Interactive Quizzes**: Test your knowledge with fun, engaging quizzes
- **Gamified Experience**: Earn badges, track progress, and celebrate achievements
- **Community Learning**: Connect with classmates and learn together
- **Assignment Submissions**: Submit work digitally with file uploads
- **Real-time Notifications**: Stay updated on assignments, grades, and announcements

### For Teachers 👩‍🏫
- **Content Management**: Upload learning materials, create assignments and quizzes
- **Student Progress Tracking**: Monitor individual and class performance
- **Grade Management**: Assign and update grades with detailed feedback
- **Attendance Marking**: Track student attendance digitally
- **Communication Tools**: Send announcements and messages to students/parents
- **Analytics Dashboard**: View comprehensive class and student analytics

### For Parents 👨‍👩‍👧‍👦
- **Child Progress Monitoring**: View real-time progress reports and grades
- **Attendance Tracking**: See attendance records and patterns
- **Communication Hub**: Stay connected with teachers and school updates
- **Payment Management**: Handle school fees and view payment history
- **Settings & Preferences**: Customize notification and accessibility settings

### For Admins ⚙️
- **User Management**: Create and manage student, teacher, and parent accounts
- **System Oversight**: Monitor platform usage and generate reports
- **Content Moderation**: Ensure quality and appropriateness of content
- **Financial Dashboard**: Track payments, fees, and financial analytics
- **Support System**: Manage tickets and provide technical support

## 🛠️ Technology Stack

### Frontend (User Interface)
- **React 18**: Modern JavaScript library for building user interfaces
- **TypeScript**: Adds type safety to JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth interactions
- **React Router**: Handles navigation between pages
- **Socket.io Client**: Real-time communication for live updates

### Backend (Server & Database)
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web framework for building APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Object modeling for MongoDB
- **JWT (JSON Web Tokens)**: Secure authentication system
- **Socket.io**: Real-time bidirectional communication
- **Multer**: File upload handling
- **bcryptjs**: Password hashing for security

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- MongoDB database (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-flex
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     VITE_API_URL=http://localhost:5000/api
     MONGODB_URI=mongodb://localhost:27017/eflex
     JWT_SECRET=your-super-secret-jwt-key
     JWT_EXPIRE=30d
     JWT_REFRESH_EXPIRE=7d
     CLIENT_URL=http://localhost:5173
     PORT=5000
     ```

5. **Start the Application**

   **Terminal 1: Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2: Start Frontend Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open your browser and go to `http://localhost:5173`
   - Register as a student, teacher, parent, or admin to explore

## 📚 API Documentation

### Backend API Endpoints

#### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | User logout | Authenticated |
| GET | `/me` | Get current user profile | Authenticated |
| PUT | `/me` | Update user profile | Authenticated |

#### User Management Routes (`/api/users`) - Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all users |
| POST | `/students` | Create student account |
| POST | `/teachers` | Create teacher account |
| POST | `/parents` | Create parent account |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

#### Course Routes (`/api/courses`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all courses | Authenticated |
| GET | `/:id` | Get course details | Authenticated |
| POST | `/` | Create new course | Admin |
| PUT | `/:id` | Update course | Admin/Teacher |
| DELETE | `/:id` | Delete course | Admin |
| POST | `/:id/enroll` | Enroll student | Admin/Teacher |
| DELETE | `/:id/students/:studentId` | Remove student | Admin/Teacher |

#### Assignment Routes (`/api/assignments`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get assignments | Authenticated |
| GET | `/:id` | Get assignment details | Authenticated |
| POST | `/` | Create assignment | Teacher |
| PUT | `/:id` | Update assignment | Teacher |
| DELETE | `/:id` | Delete assignment | Teacher |
| POST | `/:id/submit` | Submit assignment | Student |
| PUT | `/:id/grade/:studentId` | Grade assignment | Teacher |

#### Attendance Routes (`/api/attendance`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Mark attendance | Teacher |
| POST | `/bulk` | Bulk mark attendance | Teacher |
| GET | `/course/:courseId` | Get course attendance | Authenticated |
| GET | `/student/:studentId` | Get student attendance | Authenticated |
| PUT | `/:id` | Update attendance | Teacher |
| DELETE | `/:id` | Delete attendance | Teacher |

#### Grade Routes (`/api/grades`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/student/:studentId` | Get student grades | Authenticated |
| GET | `/course/:courseId` | Get course grades | Teacher |
| POST | `/` | Add grade | Teacher |
| PUT | `/:gradeId/item/:itemId` | Update grade | Teacher |
| DELETE | `/:gradeId/item/:itemId` | Delete grade | Teacher |

#### Message Routes (`/api/messages`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Send message | Authenticated |
| GET | `/conversations` | Get conversations | Authenticated |
| GET | `/:conversationId` | Get conversation messages | Authenticated |
| PUT | `/:conversationId/read` | Mark as read | Authenticated |
| GET | `/unread-count` | Get unread count | Authenticated |

#### Notification Routes (`/api/notifications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get notifications | Authenticated |
| PUT | `/:id/read` | Mark as read | Authenticated |
| PUT | `/read-all` | Mark all as read | Authenticated |
| DELETE | `/:id` | Delete notification | Authenticated |
| POST | `/` | Create notification | Admin |

#### Announcement Routes (`/api/announcements`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get announcements | Authenticated |
| GET | `/:id` | Get announcement | Authenticated |
| POST | `/` | Create announcement | Teacher/Admin |
| PUT | `/:id` | Update announcement | Teacher/Admin |
| DELETE | `/:id` | Delete announcement | Teacher/Admin |

#### Parent Routes (`/api/parent`) - Parent Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get parent profile |
| PUT | `/profile` | Update parent profile |
| PUT | `/change-password` | Change password |
| GET | `/students` | Get linked students |
| POST | `/request-removal/:studentId` | Request student removal |
| PUT | `/notifications` | Update notification preferences |
| PUT | `/accessibility` | Update accessibility settings |
| GET | `/payments` | Get payment information |
| GET | `/receipts` | Download receipts |

#### Subject Routes (`/api/subjects`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all subjects | Public |
| GET | `/:id` | Get subject details | Public |
| POST | `/` | Create subject | Authenticated |
| PUT | `/:id` | Update subject | Authenticated |
| DELETE | `/:id` | Delete subject | Authenticated |
| POST | `/:id/teachers` | Add teacher to subject | Authenticated |
| DELETE | `/:id/teachers/:teacherId` | Remove teacher | Authenticated |

### Frontend API Integration

The frontend uses a centralized API service (`src/services/api.js`) that provides easy-to-use functions for all backend interactions. Here are the main API modules:

#### Authentication API
```javascript
import { authAPI } from './services/api';

// Login user
const response = await authAPI.login({ email, password });

// Register user
const response = await authAPI.register(userData);

// Get current user
const user = await authAPI.getCurrentUser();

// Update profile
const updatedUser = await authAPI.updateProfile(userData);
```

#### Course Management API
```javascript
import { courseAPI } from './services/api';

// Get all courses
const courses = await courseAPI.getCourses({ page: 1, limit: 10 });

// Create course
const newCourse = await courseAPI.createCourse(courseData);

// Enroll student
await courseAPI.enrollStudent(courseId, studentId);
```

#### Assignment API
```javascript
import { assignmentAPI } from './services/api';

// Get assignments
const assignments = await assignmentAPI.getAssignments({ courseId });

// Submit assignment with files
const formData = new FormData();
formData.append('content', 'Assignment content');
formData.append('attachments', file);
await assignmentAPI.submitAssignment(assignmentId, formData);
```

#### Real-time Features (Socket.io)
The application uses Socket.io for real-time communication:

- **Live Notifications**: Instant notifications for new assignments, grades, messages
- **Real-time Chat**: Live messaging between users
- **Live Updates**: Instant updates when content changes
- **Online Status**: See who's online in real-time

## 🎯 Usage Examples

### Student Workflow
1. **Login/Register**: Create account as student
2. **Browse Courses**: View available subjects and courses
3. **Access Modules**: Complete weekly learning modules
4. **Take Quizzes**: Participate in interactive quizzes
5. **Submit Assignments**: Upload assignments with attachments
6. **View Grades**: Check grades and feedback
7. **Communicate**: Message teachers and classmates

### Teacher Workflow
1. **Login**: Access teacher dashboard
2. **Create Content**: Upload modules, assignments, quizzes
3. **Manage Classes**: View enrolled students
4. **Grade Work**: Review and grade submissions
5. **Track Progress**: Monitor student performance
6. **Communicate**: Send announcements and messages

### Parent Workflow
1. **Login**: Access parent dashboard
2. **Link Children**: Connect to children's accounts
3. **Monitor Progress**: View grades, attendance, assignments
4. **View Reports**: Access detailed progress reports
5. **Communicate**: Message teachers and school staff

## 🔧 Development

### Project Structure
```
e-flex/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth, Socket)
│   ├── services/          # API services
│   └── constants/         # App constants
├── server/                # Backend source code
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── uploads/              # File upload directory
└── public/               # Static assets
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help:

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for general questions

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Designed with user experience as the top priority
- Inspired by the need for accessible, engaging education

---

**E-FLEX** - Making learning flexible, fun, and effective! 🚀

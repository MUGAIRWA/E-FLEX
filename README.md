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
- **TypeScript & JSX**: Type-safe and component-driven UI development
- **Vite 5**: Fast build tool and development server
- **Tailwind CSS 3**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Clean, consistent icon library
- **React Router v6**: Client-side routing and navigation
- **Axios**: HTTP client with automatic JWT refresh interceptors
- **Socket.io Client**: Real-time communication (with automatic polling fallback on serverless deployments)

### Backend (Server & Database)
- **Node.js & Express.js**: REST API server (runs standalone locally and as a Vercel Serverless Function in production)
- **PostgreSQL**: Relational database for structured educational data
- **Prisma ORM (v6)**: Type-safe database client, schema management (`schema.prisma`), and seeding
- **JWT (JSON Web Tokens)**: Access & SHA-256 hashed refresh token authentication
- **Socket.io**: Real-time bidirectional communication for notifications and messaging
- **Multer 2**: Multipart file upload handling for assignments, course materials, and exams
- **bcryptjs**: Password hashing for security

### Deployment & Hosting
- **Vercel**: Unified hosting for the Vite React SPA frontend and Express serverless API (`/api/*`)
- **Prisma Postgres**: Managed pooled PostgreSQL database

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm package manager
- PostgreSQL database (local instance or cloud provider such as Prisma Postgres / Neon / Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MUGAIRWA/E-FLEX.git
   cd E-FLEX
   ```

2. **Install Frontend & Root Dependencies**
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
   - Create a `.env` file in the root directory:
     ```env
     # Server Configuration
     PORT=5000
     NODE_ENV=development

     # Database Configuration (PostgreSQL / Prisma)
     DATABASE_URL="postgresql://user:password@localhost:5432/eflex?schema=public"

     # JWT Configuration
     JWT_SECRET=your-super-secret-jwt-key
     REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
     JWT_EXPIRES_IN=30d

     # Frontend URL (for CORS)
     CLIENT_URL=http://localhost:5173

     # Socket.IO Configuration
     SOCKET_PORT=5000
     ```

5. **Initialize & Seed the PostgreSQL Database**
   ```bash
   cd server
   npm run db:push
   npm run db:seed
   cd ..
   ```

6. **Start the Application**

   **Terminal 1: Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2: Start Frontend Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Local development: `http://localhost:5173`
   - Live production deployment: `https://e-flex-zeta.vercel.app`
   - Default seeded accounts (password: `password123`):
     - **Admin**: `admin@eflex.edu`
     - **Teacher**: `teacher@eflex.edu`
     - **Student**: `student@eflex.edu`
     - **Parent**: `parent@eflex.edu`

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
E-FLEX/
├── api/                    # Vercel Serverless Function entrypoint
│   ├── index.js            # Exports the Express backend app for Vercel
│   └── package.json        # CommonJS module boundary for /api
├── src/                    # Frontend source code (React + Vite + Tailwind CSS)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Role-based page views (Student, Teacher, Parent, Admin, Auth)
│   ├── contexts/           # React contexts (AuthContext, SocketContext)
│   ├── services/           # Axios API service modules (api.js)
│   └── constants/          # Application constants
├── server/                 # Backend source code (Express + Prisma)
│   ├── prisma/             # Prisma PostgreSQL schema (schema.prisma) & seed script (seed.js)
│   ├── controllers/        # Route controllers
│   ├── routes/             # Express API route definitions
│   ├── middleware/         # Auth, HTTP serializer, error handling, and Multer uploads
│   ├── utils/              # Socket.IO manager, notifications, and helpers
│   └── config/             # Prisma client & database connection config
├── vercel.json             # Vercel routing & serverless function bundling config
└── package.json            # Frontend dependencies and Vercel build scripts
```

### Available Scripts

**Root / Frontend (`/`):**
- `npm run dev` - Start Vite frontend development server
- `npm run build` - Build frontend for production
- `npm run vercel-build` - Generate Prisma client and build Vite frontend for Vercel
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

**Backend (`/server`):**
- `npm run dev` - Start backend development server with `nodemon`
- `npm start` - Start production Express server
- `npm run db:push` - Push Prisma schema to PostgreSQL (`prisma db push`)
- `npm run db:seed` - Seed PostgreSQL database with initial demo accounts (`node prisma/seed.js`)
- `npm run db:studio` - Open Prisma Studio GUI to inspect/edit database records

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

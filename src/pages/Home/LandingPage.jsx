import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  FileCheck2Icon,
  CalendarIcon,
  MessageSquareIcon,
  BarChart3Icon,
  AwardIcon,
  CompassIcon
} from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Button } from '../../components/ui/Button';

const ROLE_OPTIONS = [
  {
    id: 'student',
    label: 'Student',
    actionLabel: 'Enter Student Portal',
    summary: 'Follow weekly Form 1–4 subject modules, submit holiday work, and get teacher feedback.'
  },
  {
    id: 'teacher',
    label: 'Teacher',
    actionLabel: 'Open Teacher Workspace',
    summary: 'Publish structured notes, set timed assessments, and review class progress before opening day.'
  },
  {
    id: 'parent',
    label: 'Parent',
    actionLabel: 'View Parent Portal',
    summary: 'Check your child’s weekly completion, quiz scores, and teacher remarks from your phone.'
  },
  {
    id: 'admin',
    label: 'School Admin',
    actionLabel: 'Manage Institution',
    summary: 'Coordinate streams, assign subject teachers, and oversee holiday academic continuity.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Wanjiku Ndung’u',
    role: 'Form 3 Student • Nakuru',
    quote:
      'Instead of carrying five photocopied holiday booklets that nobody marks until Week 3, I finish two Chemistry and Maths modules every week and see my teacher’s notes the next morning.',
    image: '/images/student-studying.jpg',
    subjectTag: 'Chemistry & Mathematics'
  },
  {
    name: 'Madam Achieng',
    role: 'Senior Biology Teacher • Kisumu',
    quote:
      'When term opens, I already know which concepts Form 2 Blue struggled with over the break. It saves me two full weeks of remedial marking and lets me teach from day one.',
    image: '/images/teacher-achieng.jpg',
    subjectTag: 'Form 2 & Form 4 Biology'
  },
  {
    name: 'Grace Ochieng',
    role: 'Parent of Two • Eldoret',
    quote:
      'I used to ask my son if he had done his holiday homework and had no way of knowing. Now I can see his completed modules, quiz marks, and his class teacher’s comments.',
    image: '/images/parent-grace.jpg',
    subjectTag: 'Parent Dashboard'
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');

  const activeRole = ROLE_OPTIONS.find((r) => r.id === userType) || ROLE_OPTIONS[0];

  const handleGetStarted = () => {
    navigate(`/auth/${userType}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F1] text-[#16211E]">
      <Navbar />

      {/* Editorial Hero Section */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Editorial Copy & Role Entry */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EFECE4] border border-[#DFD9CA] text-[#134E4A] text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C85A28]" />
                Built for Kenyan Secondary Schools & Families
              </div>

              <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-[54px] text-[#16211E] leading-[1.12] tracking-tight mb-6">
                Keep learning active when the{' '}
                <span className="font-serif italic font-normal text-[#C85A28]">
                  school bell stops ringing.
                </span>
              </h1>

              <p className="text-lg text-[#4A5552] mb-8 max-w-2xl leading-relaxed">
                Replace ungraded paper holiday packets with structured weekly modules, teacher-marked
                assignments, and transparent progress reports for parents—all for KSh 250 per
                subject.
              </p>

              {/* Tactile Role Switcher Box */}
              <div className="bg-white rounded-2xl border border-[#E5E0D5] p-4 sm:p-5 shadow-[0_4px_20px_-6px_rgba(22,33,30,0.06)] max-w-xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5C6663] mb-3">
                  Choose your portal to begin
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#F4F1EA] p-1.5 rounded-xl mb-4">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setUserType(role.id)}
                      className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        userType === role.id
                          ? 'bg-[#134E4A] text-white shadow-sm'
                          : 'text-[#4A5552] hover:text-[#16211E]'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-xs sm:text-sm text-[#4A5552] leading-snug flex-1">
                    {activeRole.summary}
                  </p>
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C85A28] hover:bg-[#B24D1F] text-white text-sm font-semibold transition-colors shrink-0"
                  >
                    <span>{activeRole.actionLabel}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="mt-8 pt-6 border-t border-[#E5E0D5] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="font-poppins font-bold text-2xl text-[#16211E]">Form 1–4</div>
                  <div className="text-xs text-[#5C6663] mt-0.5">8-4-4 & CBC Aligned</div>
                </div>
                <div>
                  <div className="font-poppins font-bold text-2xl text-[#16211E]">Weekly</div>
                  <div className="text-xs text-[#5C6663] mt-0.5">Paced study milestones</div>
                </div>
                <div>
                  <div className="font-poppins font-bold text-2xl text-[#134E4A]">KSh 250</div>
                  <div className="text-xs text-[#5C6663] mt-0.5">Per subject / holiday</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Human Photography & Live UI Artifact */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-[#DCD6C8] bg-[#134E4A] shadow-xl">
                <img
                  src="/images/hero-students.jpg"
                  alt="Kenyan secondary school students collaborating on digital coursework"
                  className="w-full h-[440px] sm:h-[490px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11221F]/90 via-[#11221F]/25 to-transparent" />

                {/* Bottom Overlay Inside Photo */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="bg-white/95 backdrop-blur-md text-[#16211E] rounded-2xl p-4 border border-[#E5E0D5] shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#134E4A] bg-[#E6F0EE] px-2.5 py-0.5 rounded-md">
                        Form 3 • Week 3 Module
                      </span>
                      <span className="text-xs font-medium text-[#1E7A50] flex items-center gap-1">
                        <CheckCircle2Icon className="w-3.5 h-3.5" />
                        Graded by Mr. Kamau
                      </span>
                    </div>
                    <p className="font-poppins font-bold text-sm sm:text-base text-[#16211E]">
                      Organic Chemistry I: Hydrocarbons & Alkanes
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#5C6663]">
                      <span>Quiz Score: 27 / 30 (90%)</span>
                      <span className="font-semibold text-[#C85A28]">Parent Notified ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Top-Left Teacher Card */}
              <div className="hidden sm:flex items-center gap-3 absolute -top-5 -left-6 bg-white rounded-2xl p-3.5 border border-[#E5E0D5] shadow-lg max-w-xs">
                <img
                  src="/images/teacher-achieng.jpg"
                  alt="Madam Achieng portrait"
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-[#16211E]">Madam Achieng • Biology</div>
                  <div className="text-[11px] text-[#5C6663]">
                    Uploaded Cell Physiology notes & 15-min quiz
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Editorial Bento Section: Curriculum & Tools */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C85A28]">
                How the Platform Works
              </span>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2 max-w-xl">
                Designed around how real teachers teach and students revise.
              </h2>
            </div>
            <p className="text-[#4A5552] max-w-md text-sm sm:text-base">
              No gimmicks or overwhelming menus—just structured weekly coursework, clear submission
              deadlines, and direct teacher feedback.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Large Feature 1: Weekly Pacing */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E0D5] p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#134E4A] bg-[#E8F1EF] px-3 py-1 rounded-lg mb-5">
                  <CalendarIcon className="w-4 h-4" />
                  Weekly Paced Modules
                </div>
                <h3 className="font-poppins font-bold text-2xl text-[#16211E] mb-3">
                  Break holiday revision into manageable weekly goals
                </h3>
                <p className="text-[#4A5552] text-sm sm:text-base leading-relaxed mb-6">
                  Instead of dumping 60 pages of questions on the last day of term, teachers release
                  topic-by-topic notes, worked examples, and short quizzes each week of the break.
                </p>
              </div>

              {/* Visual Weekly Timeline Preview */}
              <div className="bg-[#F8F6F1] rounded-2xl p-4 sm:p-5 border border-[#E5E0D5] space-y-3">
                {[
                  {
                    week: 'Week 1',
                    topic: 'Quadratic Expressions & Equations',
                    status: 'Completed • 94%',
                    done: true
                  },
                  {
                    week: 'Week 2',
                    topic: 'Approximations, Errors & Trigonometry',
                    status: 'Submitted • Awaiting Remark',
                    done: true
                  },
                  {
                    week: 'Week 3',
                    topic: 'Surds & Further Logarithms (Quiz + Worksheet)',
                    status: 'In Progress • Due Friday',
                    done: false
                  }
                ].map((item) => (
                  <div
                    key={item.week}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-[#E5E0D5]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          item.done
                            ? 'bg-[#134E4A] text-white'
                            : 'bg-[#F3E8DF] text-[#C85A28]'
                        }`}
                      >
                        {item.week}
                      </span>
                      <span className="text-sm font-semibold text-[#16211E]">{item.topic}</span>
                    </div>
                    <span className="text-xs font-medium text-[#5C6663] hidden sm:inline">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 2: Teacher Grading & Uploads with Photography */}
            <div className="lg:col-span-5 bg-[#134E4A] text-white rounded-3xl p-7 sm:p-9 flex flex-col justify-between overflow-hidden relative">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F4E9DC] bg-white/10 px-3 py-1 rounded-lg mb-5">
                  <FileCheck2Icon className="w-4 h-4" />
                  Assignments & Timed Quizzes
                </div>
                <h3 className="font-poppins font-bold text-2xl mb-3">
                  Real teacher feedback, not just automated scores
                </h3>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6">
                  Students upload handwritten workings, lab reports, or essays alongside interactive
                  quizzes—and receive personalized corrections from their subject teachers.
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img
                  src="/images/student-studying.jpg"
                  alt="Kenyan student writing notes while studying"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>

            {/* Bottom 3 Cards */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E0D5] p-7">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8DF] text-[#C85A28] flex items-center justify-center mb-4">
                <BarChart3Icon className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                Parent Visibility Without Nagging
              </h3>
              <p className="text-sm text-[#4A5552] leading-relaxed">
                Parents link directly to their child’s student account to see attendance, submitted
                assignments, and subject trends in real time.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E0D5] p-7">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1EF] text-[#134E4A] flex items-center justify-center mb-4">
                <MessageSquareIcon className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                Direct Teacher Consultation
              </h3>
              <p className="text-sm text-[#4A5552] leading-relaxed">
                When a student gets stuck on a holiday question, they can send a help request to
                their subject teacher instead of waiting weeks for school to reopen.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E0D5] p-7">
              <div className="w-10 h-10 rounded-xl bg-[#EFECE4] text-[#16211E] flex items-center justify-center mb-4">
                <AwardIcon className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                Class & Stream Organization
              </h3>
              <p className="text-sm text-[#4A5552] leading-relaxed">
                Every course, exam, and announcement is neatly organized by Form (Form 1–4) and
                Stream (Blue, Green, East, West) so students only see what applies to them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial About Preview Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EFECE3] border-y border-[#E2DDD0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/images/classroom-guidance.jpg"
                  alt="Kenyan teacher guiding students in classroom"
                  className="rounded-2xl h-64 w-full object-cover border border-[#DCD6C8]"
                />
                <img
                  src="/images/parent-grace.jpg"
                  alt="Kenyan parent reviewing student progress on tablet"
                  className="rounded-2xl h-64 w-full object-cover border border-[#DCD6C8] mt-8"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-widest text-[#134E4A]">
                Why Schools & Families Choose E-Flex
              </span>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2 mb-5">
                Four dedicated portals working together in one academic ecosystem.
              </h2>
              <p className="text-[#4A5552] text-base sm:text-lg leading-relaxed mb-8">
                Whether you are a Form 4 candidate revising for national exams, a teacher organizing
                holiday coursework, or a parent keeping track of term progress, E-Flex gives each
                role a clean, focused workspace.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    title: 'For Students',
                    desc: 'Download notes, complete weekly modules, and track subject grades.'
                  },
                  {
                    title: 'For Teachers',
                    desc: 'Upload resources, grade submissions, and monitor stream attendance.'
                  },
                  {
                    title: 'For Parents',
                    desc: 'Follow your child’s real-time performance and school announcements.'
                  },
                  {
                    title: 'For School Admins',
                    desc: 'Manage teachers, subjects, streams, and institutional reporting.'
                  }
                ].map((role) => (
                  <div
                    key={role.title}
                    className="bg-white/90 rounded-2xl p-4 border border-[#DFD9CA]"
                  >
                    <div className="font-poppins font-bold text-sm text-[#134E4A] mb-1">
                      {role.title}
                    </div>
                    <div className="text-xs sm:text-sm text-[#4A5552]">{role.desc}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="md" onClick={() => navigate('/about')}>
                  Read Our Full Story & FAQ
                </Button>
                <Button variant="outline" size="md" onClick={handleGetStarted}>
                  Open Your Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Community Stories */}
      <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C85A28]">
              From Our Community
            </span>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2">
              Trusted by students, teachers, and parents across the country.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-3xl border border-[#E5E0D5] p-7 flex flex-col justify-between shadow-[0_2px_12px_-4px_rgba(22,33,30,0.05)]"
              >
                <div>
                  <span className="inline-block text-[11px] font-semibold text-[#134E4A] bg-[#E8F1EF] px-3 py-1 rounded-md mb-5">
                    {item.subjectTag}
                  </span>
                  <p className="text-[#2C3734] text-base leading-relaxed mb-6">
                    “{item.quote}”
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-[#EFECE4]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#DCD6C8]"
                  />
                  <div>
                    <div className="font-poppins font-bold text-sm text-[#16211E]">{item.name}</div>
                    <div className="text-xs text-[#5C6663]">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto bg-[#134E4A] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#F4E9DC]/80">
                Start This Term
              </span>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl mt-2 mb-4">
                Ready to make holiday study structured and stress-free?
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl">
                Enroll for KSh 250 per subject or sign in with your school credentials to access
                your classes, modules, and progress reports.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:justify-end gap-3">
              <Button variant="secondary" size="lg" onClick={handleGetStarted}>
                Get Started Now
              </Button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="px-6 py-3.5 rounded-xl border border-white/25 text-white font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16211E] text-[#EAE6DF] py-14 px-4 sm:px-6 lg:px-8 border-t border-[#263531]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#134E4A] flex items-center justify-center text-white">
                <BookOpenIcon className="w-4 h-4" />
              </div>
              <span className="font-poppins font-bold text-xl text-white">
                E-Flex<span className="text-[#C85A28]">.</span>
              </span>
            </div>
            <p className="text-sm text-[#9BA6A2] max-w-sm">
              Continuous digital learning, structured holiday modules, and transparent academic
              tracking for secondary schools and families.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Our Story & FAQ
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/student')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/teacher')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Teacher Workspace
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/parent')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Parent Portal
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-[#263531] flex flex-col sm:flex-row justify-between text-xs text-[#7D8985] gap-4">
          <span>© 2026 E-Flex Learning Platform. Built for Kenyan educators and learners.</span>
          <span>Form 1 – Form 4 Academic Continuity</span>
        </div>
      </footer>
    </div>
  );
}

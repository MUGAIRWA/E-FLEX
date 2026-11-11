import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ChevronDownIcon,
  TargetIcon,
  EyeIcon,
  BarChart3Icon,
  HeartHandshakeIcon
} from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Button } from '../../components/ui/Button';

type RoleKey = 'student' | 'teacher' | 'parent' | 'admin';

interface RoleDetail {
  key: RoleKey;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
}

const ROLE_DETAILS: RoleDetail[] = [
  {
    key: 'student',
    label: 'Students',
    badge: 'Student Portal',
    tagline: 'Structured weekly revision without last-minute holiday panic.',
    description:
      'Instead of bulky photocopied holiday packets that get misplaced or rushed on the final weekend before school reopens, E-Flex breaks Form 1–4 revision into clear weekly modules, interactive quizzes, and teacher-marked assignments.',
    image: '/images/student-studying.jpg',
    highlights: [
      'Form 1 – Form 4 subject modules organized week by week',
      'Timed interactive quizzes with immediate score breakdowns',
      'Digital assignment submissions with worksheet & photo uploads',
      'Clear subject-by-subject mastery tracking and study progress',
      'Direct help requests and messaging with subject teachers'
    ]
  },
  {
    key: 'teacher',
    label: 'Teachers',
    badge: 'Teacher Workspace',
    tagline: 'Know exactly how your class performed before term even begins.',
    description:
      'E-Flex gives educators a focused digital teaching workspace to publish notes and videos, set timed assessments, mark uploaded assignments, and spot topics that need class review on opening week.',
    image: '/images/teacher-achieng.jpg',
    highlights: [
      'Publish study notes, PDFs, presentations, and video lessons by class & stream',
      'Create multiple-choice and structured exams with custom time limits',
      'Grade student submissions with personalized written remarks',
      'Bulk attendance marking and class-wide performance summaries',
      'Send targeted announcements to specific classes, students, or parents'
    ]
  },
  {
    key: 'parent',
    label: 'Parents',
    badge: 'Parent Dashboard',
    tagline: 'Peace of mind and transparent visibility into your child’s study habits.',
    description:
      'Parents link directly to their children’s student accounts to view completed weekly modules, quiz grades, teacher feedback, and school announcements from any device.',
    image: '/images/parent-grace.jpg',
    highlights: [
      'Link one or multiple children under a single parent account',
      'Review subject grades, exam scores, and teacher feedback in real time',
      'Monitor weekly attendance and assignment submission consistency',
      'Communicate directly with subject teachers and school leadership',
      'Manage KSh 250/subject enrollment payments and downloadable receipts'
    ]
  },
  {
    key: 'admin',
    label: 'School Admins',
    badge: 'Institution Administration',
    tagline: 'Complete academic oversight across teachers, streams, and subjects.',
    description:
      'Principals, Directors of Studies, and platform administrators coordinate student enrollment, teacher subject allocation, stream organization, and school-wide reporting from one dashboard.',
    image: '/images/school-admin.jpg',
    highlights: [
      'Create and manage student, teacher, parent, and admin accounts',
      'Configure subjects, assign teachers, and structure Form 1–4 streams',
      'Track course activity, submission rates, and financial summaries',
      'Broadcast school-wide administrative or urgent announcements',
      'Resolve student and parent support tickets cleanly'
    ]
  }
];

const FAQS = [
  {
    question: 'What problem does E-Flex solve for secondary schools and families?',
    answer:
      'During school holidays, students typically go home with thick paper assignment booklets and zero teacher interaction for 3 to 8 weeks. Many students procrastinate until the final days, teachers spend the start of the new term marking piles of paper, and parents have no visibility until report cards arrive. E-Flex replaces that broken cycle with paced weekly digital modules, immediate quiz grading, teacher feedback, and live parent dashboards.'
  },
  {
    question: 'How does the weekly module system work?',
    answer:
      'Courses are structured by subject, class (Form 1 to Form 4), and stream. Teachers publish weekly reading notes, worked examples, video links, and assignments so learners complete manageable milestones every week of the holiday.'
  },
  {
    question: 'How do parents connect to their child’s account?',
    answer:
      'During parent registration—or inside the Parent Dashboard settings—a parent enters their child’s registered student email address. The platform links the two accounts so the parent can view real-time grades, attendance, and teacher remarks.'
  },
  {
    question: 'How much does E-Flex cost?',
    answer:
      'E-Flex is priced at KSh 250 per subject to remain accessible for families while providing full access to weekly learning modules, timed quizzes, assignment grading, and downloadable revision materials.'
  }
];

export function AboutPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<RoleKey>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedRole = ROLE_DETAILS.find((r) => r.key === activeRole) || ROLE_DETAILS[0];

  return (
    <div className="min-h-screen w-full bg-[#F8F6F1] text-[#16211E] flex flex-col">
      <Navbar />

      {/* Editorial Hero Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE4] border border-[#DFD9CA] text-[#134E4A] text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C85A28]" />
                Our Story & Educational Philosophy
              </div>

              <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-[52px] text-[#16211E] leading-[1.14] tracking-tight mb-6">
                Built so learning doesn’t pause at the{' '}
                <span className="font-serif italic font-normal text-[#C85A28]">
                  end of the school term.
                </span>
              </h1>

              <p className="text-lg text-[#4A5552] leading-relaxed mb-8 max-w-2xl">
                E-Flex was created to bridge the long gap between school terms. We give students
                structured weekly guidance, teachers modern digital grading tools, and parents
                honest, real-time insight into their children’s academic growth.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
                  Enroll or Sign In
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </motion.div>

            {/* Right Photo Grid */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl overflow-hidden border border-[#DCD6C8] shadow-lg bg-[#134E4A]">
                <img
                  src="/images/hero-students.jpg"
                  alt="Kenyan secondary school students studying together"
                  className="w-full h-96 object-cover"
                />
                <div className="p-6 bg-[#134E4A] text-white">
                  <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/15">
                    <div>
                      <div className="font-poppins font-bold text-2xl">Form 1–4</div>
                      <div className="text-[11px] text-white/75 mt-0.5">Secondary Classes</div>
                    </div>
                    <div>
                      <div className="font-poppins font-bold text-2xl">4 Portals</div>
                      <div className="text-[11px] text-white/75 mt-0.5">Connected Roles</div>
                    </div>
                    <div>
                      <div className="font-poppins font-bold text-2xl text-[#F4A261]">KSh 250</div>
                      <div className="text-[11px] text-white/75 mt-0.5">Per Subject</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why We Built E-Flex (Editorial Story Section) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C85A28]">
                The Challenge We Saw
              </span>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2 mb-6">
                Why traditional holiday homework packets fail students.
              </h2>
              <div className="rounded-2xl overflow-hidden border border-[#E5E0D5]">
                <img
                  src="/images/classroom-guidance.jpg"
                  alt="Kenyan teacher guiding secondary students"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <p className="text-lg text-[#3B4744] leading-relaxed">
                At the close of every school term, students across Kenya carry home thick stacks of
                photocopied holiday revision papers. For weeks, they work in isolation—without
                worked explanations when they get stuck, without pacing, and without any teacher
                feedback.
              </p>
              <p className="text-base text-[#4A5552] leading-relaxed">
                By the time schools reopen, students have either rushed through the booklet on the
                final weekend or left difficult topics blank. Teachers then lose valuable teaching
                time marking backlogs instead of moving forward with the syllabus.
              </p>

              <div className="grid sm:grid-cols-2 gap-5 pt-4">
                <div className="bg-[#F8F6F1] rounded-2xl p-6 border border-[#E5E0D5]">
                  <div className="w-10 h-10 rounded-xl bg-[#134E4A] text-white flex items-center justify-center mb-4">
                    <TargetIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                    Our Mission
                  </h3>
                  <p className="text-sm text-[#4A5552] leading-relaxed">
                    To make continuous, teacher-guided study accessible and structured for every
                    secondary learner, regardless of where they spend their school holidays.
                  </p>
                </div>

                <div className="bg-[#F8F6F1] rounded-2xl p-6 border border-[#E5E0D5]">
                  <div className="w-10 h-10 rounded-xl bg-[#C85A28] text-white flex items-center justify-center mb-4">
                    <EyeIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                    Our Vision
                  </h3>
                  <p className="text-sm text-[#4A5552] leading-relaxed">
                    An educational ecosystem where students, teachers, and parents stay connected
                    year-round through clear data and supportive feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pedagogical Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 pt-14 border-t border-[#EFECE4]">
            {[
              {
                icon: <BookOpenIcon className="w-6 h-6 text-[#134E4A]" />,
                title: '1. Weekly Paced Milestones',
                description:
                  'Breaking syllabus topics into weekly modules builds consistent study habits instead of last-minute cramming.'
              },
              {
                icon: <BarChart3Icon className="w-6 h-6 text-[#C85A28]" />,
                title: '2. Immediate Diagnostic Feedback',
                description:
                  'Interactive quizzes and teacher-graded uploads show learners where they went wrong while the topic is still fresh.'
              },
              {
                icon: <HeartHandshakeIcon className="w-6 h-6 text-[#1E7A50]" />,
                title: '3. Active Parent Partnership',
                description:
                  'Parents see real-time completion and grades on their phones, turning home conversations from guesswork into encouragement.'
              }
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[#F8F6F1] rounded-2xl p-6 border border-[#E5E0D5]"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="font-poppins font-bold text-lg text-[#16211E] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#4A5552] leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Role Breakdown */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#134E4A]">
                Inside the Ecosystem
              </span>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2">
                How E-Flex works for every pillar of the school.
              </h2>
            </div>

            {/* Segmented Role Tabs */}
            <div className="inline-flex flex-wrap bg-white rounded-xl p-1.5 border border-[#E5E0D5] gap-1">
              {ROLE_DETAILS.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setActiveRole(role.key)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeRole === role.key
                      ? 'bg-[#134E4A] text-white shadow-sm'
                      : 'text-[#4A5552] hover:text-[#16211E]'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={selectedRole.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-[#E5E0D5] overflow-hidden shadow-[0_4px_20px_-6px_rgba(22,33,30,0.06)]"
          >
            <div className="grid lg:grid-cols-12">
              <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
                <img
                  src={selectedRole.image}
                  alt={selectedRole.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16211E]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="px-3 py-1 rounded-md bg-white/95 text-[#134E4A] text-xs font-bold uppercase tracking-wider">
                    {selectedRole.badge}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 p-7 sm:p-10">
                <h3 className="font-poppins font-bold text-2xl sm:text-3xl text-[#16211E] mb-3">
                  {selectedRole.tagline}
                </h3>
                <p className="text-[#4A5552] text-sm sm:text-base leading-relaxed mb-6">
                  {selectedRole.description}
                </p>

                <div className="bg-[#F8F6F1] rounded-2xl p-5 border border-[#E5E0D5] mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5C6663] mb-3">
                    Included in the {selectedRole.label} Experience
                  </div>
                  <ul className="space-y-2.5">
                    {selectedRole.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[#2C3734]">
                        <CheckCircle2Icon className="w-4 h-4 text-[#1E7A50] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/auth/${selectedRole.key}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C85A28] hover:bg-[#B24D1F] text-white text-sm font-semibold transition-colors"
                >
                  <span>Sign In to {selectedRole.badge}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E0D5]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C85A28]">
              Common Questions
            </span>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#16211E] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="border border-[#E5E0D5] rounded-2xl overflow-hidden bg-[#F8F6F1]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left font-poppins font-semibold text-[#16211E] hover:text-[#134E4A] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-[#5C6663] transition-transform shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#134E4A]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-3 text-[#4A5552] text-sm sm:text-base leading-relaxed bg-white border-t border-[#E5E0D5]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16211E] text-[#EAE6DF] py-14 px-4 sm:px-6 lg:px-8 mt-auto">
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
              onClick={() => navigate('/auth')}
              className="text-[#B8C2BE] hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;

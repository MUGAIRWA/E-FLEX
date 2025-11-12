import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenIcon, UsersIcon, TrophyIcon, SparklesIcon, GraduationCapIcon, MessageSquareIcon, ArrowRightIcon } from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
export function LandingPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const handleGetStarted = () => {
    navigate(`/auth/${userType}`);
  };

  const features = [{
    icon: <BookOpenIcon className="w-12 h-12 text-primary" />,
    title: 'Weekly Modules',
    description: 'Unlock new content each week as you progress through your learning journey'
  }, {
    icon: <TrophyIcon className="w-12 h-12 text-accent" />,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with fun quizzes and earn achievements'
  }, {
    icon: <UsersIcon className="w-12 h-12 text-success" />,
    title: 'Community Learning',
    description: 'Connect with classmates, share ideas, and learn together'
  }, {
    icon: <SparklesIcon className="w-12 h-12 text-warning" />,
    title: 'Gamified Experience',
    description: 'Earn badges, track progress, and celebrate your achievements'
  }];
  const testimonials = [{
    name: 'Sarah M.',
    role: 'Form 3 Student',
    content: 'E-Flex made my holiday learning so much fun! I actually look forward to completing my modules.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  }, {
    name: 'Mr. Kamau',
    role: 'Mathematics Teacher',
    content: 'The platform makes it easy to track student progress and provide personalized feedback.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamau'
  }, {
    name: 'Mrs. Njeri',
    role: 'Parent',
    content: "I love being able to monitor my daughter's progress and see her achievements in real-time.",
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Njeri'
  }];
  return <div className="min-h-screen w-full bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8
          }}>
              <h1 className="font-poppins font-bold text-5xl md:text-6xl mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to E-Flex,Keep Learning, Keep Flexing 💪
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Your digital classroom beyond the school walls. Keep learning,
                growing, and flexing your skills even during the holidays. No
                more boring homework packs — E-Flex brings you digital
                assignments, quizzes, and fun challenges that keep you learning
                on your own terms.
              </p>
              <div className="mb-8 flex justify-center">
                <div className="inline-flex bg-white rounded-full p-1 shadow-lg">
                  {['student', 'teacher', 'parent', 'admin'].map(type => <button key={type} onClick={() => setUserType(type)} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all ${userType === type ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>)}
                </div>
              </div>
              <button onClick={handleGetStarted} className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base sm:text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2 mx-auto font-semibold">
                Start as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            x: 50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="relative">
              <div className="relative w-full h-96 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl flex items-center justify-center">
                <GraduationCapIcon className="w-48 h-48 text-white opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={{
                  rotate: 360
                }} transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }} className="w-72 h-72 border-4 border-white/20 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 text-gray-800">
              Why Choose E-Flex?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for a successful learning journey
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <Card className="text-center h-full">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-poppins font-semibold text-xl mb-3 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* For Everyone Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 text-gray-800">
              Built for Everyone
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
            role: 'Students',
            description: 'Access modules, take quizzes, submit assignments, and track your progress',
            color: 'from-primary to-blue-400'
          }, {
            role: 'Teachers',
            description: 'Upload content, create quizzes, grade assignments, and monitor student performance',
            color: 'from-accent to-purple-400'
          }, {
            role: 'Parents',
            description: "Monitor your child's progress, view grades, and stay updated with announcements",
            color: 'from-success to-green-400'
          }, {
            role: 'Admins',
            description: 'Manage users, oversee platform activity, and generate comprehensive reports',
            color: 'from-warning to-red-400'
          }].map((item, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <Card className="h-full">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <span className="text-white text-2xl font-bold">
                      {item.role[0]}
                    </span>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl mb-3 text-gray-800">
                    {item.role}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 text-gray-800">
              What Our Community Says
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <Card className="h-full">
                  <div className="flex items-center mb-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4" />
                    <div>
                      <h4 className="font-poppins font-semibold text-lg text-gray-800">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-6 text-white">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students already learning with E-Flex
            </p>
            <Button variant="secondary" size="lg" onClick={handleGetStarted}>
              Get Started for KSh 250/Subject
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-poppins font-bold text-3xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            E-Flex
          </div>
          <p className="text-gray-400 mb-6">
            Your digital classroom beyond the school walls
          </p>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 E-Flex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
}
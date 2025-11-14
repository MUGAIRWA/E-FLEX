import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockIcon, CheckCircleIcon, PlayCircleIcon, ClockIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
// @ts-ignore: third-party JS module without type declarations
import { SUBJECTS } from '../../../constants/subjects';
export function ModulesTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0] as string); // Mathematics
  const subjects: string[] = SUBJECTS.slice(0, 4) as string[]; // Mathematics, English, Kiwahili, Chemistry (first 4 subjects)
  const modules = [{
    week: 1,
    title: 'Introduction to Algebra',
    status: 'completed',
    quizScore: 85,
    topics: ['Variables and Expressions', 'Linear Equations', 'Practice Problems']
  }, {
    week: 2,
    title: 'Quadratic Equations',
    status: 'completed',
    quizScore: 92,
    topics: ['Standard Form', 'Factoring', 'Quadratic Formula']
  }, {
    week: 3,
    title: 'Functions and Graphs',
    status: 'current',
    quizScore: null,
    topics: ['Function Notation', 'Graphing Techniques', 'Domain and Range']
  }, {
    week: 4,
    title: 'Polynomials',
    status: 'locked',
    quizScore: null,
    topics: ['Polynomial Operations', 'Factoring Polynomials', 'Remainder Theorem']
  }, {
    week: 5,
    title: 'Rational Expressions',
    status: 'locked',
    quizScore: null,
    topics: ['Simplifying Rationals', 'Operations', 'Complex Fractions']
  }];
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-success" />;
      case 'current':
        return <PlayCircleIcon className="w-6 h-6 text-primary" />;
      case 'locked':
        return <LockIcon className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-success to-green-400';
      case 'current':
        return 'from-primary to-blue-400';
      case 'locked':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Weekly Modules
        </h1>
        <p className="text-gray-600">
          Complete each week's quiz to unlock the next module
        </p>
      </div>
      {/* Subject Selector */}
      <div className="flex flex-wrap gap-3">
        {subjects.map((subject: string) => <motion.button key={subject} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => setSelectedSubject(subject)} className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedSubject === subject ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'}`}>
            {subject}
          </motion.button>)}
      </div>
      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module, index) => <motion.div key={index} initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card className={module.status === 'locked' ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getStatusColor(module.status)} flex items-center justify-center text-white flex-shrink-0`}>
                    <span className="font-bold text-xl">W{module.week}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-poppins font-bold text-xl text-gray-800">
                        {module.title}
                      </h3>
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map((topic, idx) => <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {topic}
                        </span>)}
                    </div>
                    {module.status === 'completed' && module.quizScore && <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-600">Quiz Score:</span>
                        <span className="font-bold text-success">
                          {module.quizScore}%
                        </span>
                      </div>}
                    {module.status === 'current' && <div className="flex items-center space-x-2 text-sm text-primary">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">In Progress</span>
                      </div>}
                    {module.status === 'locked' && <p className="text-sm text-gray-500">
                        Complete Week {module.week - 1} quiz to unlock
                      </p>}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {module.status === 'completed' && <Button variant="outline" size="sm">
                      Review
                    </Button>}
                  {module.status === 'current' && <>
                      <Button variant="primary" size="sm">
                        Continue
                      </Button>
                      <Button variant="outline" size="sm">
                        Take Quiz
                      </Button>
                    </>}
                  {module.status === 'locked' && <Button variant="outline" size="sm" className="opacity-50 cursor-not-allowed">
                      Locked
                    </Button>}
                </div>
              </div>
            </Card>
          </motion.div>)}
      </div>
    </div>;
}
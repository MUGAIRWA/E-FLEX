import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadIcon, FileTextIcon, VideoIcon, FileIcon, ClipboardListIcon, CheckCircleIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
export function ContentUploadTab() {
  const [selectedContentType, setSelectedContentType] = useState<string>('notes');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentTypes = [{
    id: 'notes',
    label: 'Notes',
    icon: <FileTextIcon className="w-6 h-6" />,
    color: 'from-primary to-blue-400'
  }, {
    id: 'video',
    label: 'Video',
    icon: <VideoIcon className="w-6 h-6" />,
    color: 'from-accent to-purple-400'
  }, {
    id: 'assignment',
    label: 'Assignment',
    icon: <FileIcon className="w-6 h-6" />,
    color: 'from-warning to-red-400'
  }, {
    id: 'quiz',
    label: 'Quiz',
    icon: <ClipboardListIcon className="w-6 h-6" />,
    color: 'from-success to-green-400'
  }];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  const handleUpload = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setUploadedFile(null);
    }, 3000);
  };
  return <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Upload Content
        </h1>
        <p className="text-gray-600">
          Share notes, videos, assignments, and quizzes with your students
        </p>
      </div>
      {/* Content Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contentTypes.map((type, index) => <motion.button key={type.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => setSelectedContentType(type.id)} className={`p-6 rounded-2xl transition-all ${selectedContentType === type.id ? 'bg-gradient-to-r ' + type.color + ' text-white shadow-xl' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary'}`}>
            <div className="flex flex-col items-center space-y-3">
              {type.icon}
              <span className="font-semibold">{type.label}</span>
            </div>
          </motion.button>)}
      </div>
      {/* Upload Form */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4
    }}>
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-6 text-gray-800">
            Upload{' '}
            {contentTypes.find(t => t.id === selectedContentType)?.label}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input type="text" placeholder={`Enter ${selectedContentType} title`} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors">
                <option>Mathematics</option>
                <option>English</option>
                <option>Kiswahili</option>
                <option>Sciences</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class/Stream
              </label>
              <select className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors">
                <option>Form 3A</option>
                <option>Form 3B</option>
                <option>Form 2A</option>
                <option>Form 4A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea rows={4} placeholder="Add a description or instructions" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            {selectedContentType === 'assignment' && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input type="date" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
              </div>}
            {selectedContentType === 'quiz' && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input type="number" placeholder="30" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors" />
              </div>}
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept={selectedContentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'} />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedContentType === 'video' ? 'MP4, AVI, MOV (Max 500MB)' : 'PDF, DOC, DOCX, PPT (Max 50MB)'}
                    </p>
                  </div>
                  {uploadedFile && <div className="flex items-center space-x-2 text-success">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {uploadedFile.name}
                      </span>
                    </div>}
                </div>
              </label>
            </div>
            <div className="flex space-x-4">
              <Button variant="primary" className="flex-1" onClick={handleUpload}>
                Upload{' '}
                {contentTypes.find(t => t.id === selectedContentType)?.label}
              </Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>
      </motion.div>
      {/* Success Message */}
      {showSuccess && <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="fixed top-20 right-4 bg-success text-white px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">Content uploaded successfully!</span>
        </motion.div>}
      {/* Recent Uploads */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.6
    }}>
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-gray-800">
            Recent Uploads
          </h3>
          <div className="space-y-3">
            {[{
            title: 'Quadratic Equations Notes',
            type: 'Notes',
            class: 'Form 3A',
            date: '2 days ago'
          }, {
            title: 'Algebra Quiz Week 3',
            type: 'Quiz',
            class: 'Form 3B',
            date: '3 days ago'
          }, {
            title: 'Geometry Assignment',
            type: 'Assignment',
            class: 'Form 2A',
            date: '5 days ago'
          }].map((item, index) => <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.type} • {item.class} • {item.date}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>)}
          </div>
        </Card>
      </motion.div>
    </div>;
}
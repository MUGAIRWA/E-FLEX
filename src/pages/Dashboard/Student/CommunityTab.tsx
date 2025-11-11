// import React from 'react';
// import { motion } from 'framer-motion';
// export function CommunityTab() {
//   return <div className="space-y-8">
//       <div>
//         <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
//           Community
//         </h1>
//         <p className="text-gray-600">
//           Connect with your classmates and teachers
//         </p>
//       </div>
//       <motion.div initial={{
//       opacity: 0,
//       y: 20
//     }} animate={{
//       opacity: 1,
//       y: 0
//     }} className="bg-white rounded-xl shadow-md p-6">
//         <p className="text-gray-700">
//           Community features will be available soon.
//         </p>
//       </motion.div>
//     </div>;
// }
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MessageSquareIcon, ThumbsUpIcon, SendIcon, AlertCircleIcon } from 'lucide-react';
export function Community() {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const discussions = [{
    id: 1,
    author: 'Sarah M.',
    subject: 'Mathematics',
    title: 'Need help with integration by parts',
    content: "Can someone explain the steps for integration by parts? I'm stuck on the practice problems.",
    likes: 12,
    replies: 5,
    time: '2 hours ago'
  }, {
    id: 2,
    author: 'John K.',
    subject: 'Physics',
    title: 'Great resource for motion problems',
    content: 'Found this amazing video that helped me understand projectile motion better. Anyone else struggling with this?',
    likes: 8,
    replies: 3,
    time: '5 hours ago'
  }];
  return <div className="min-h-screen w-full bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Community Space</h1>
          </div>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4" />
            Raise a Ticket
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* New Post */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Start a Discussion
          </h2>
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share your thoughts, ask questions, or help others..." className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} />
          <div className="flex justify-end mt-3">
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <SendIcon className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>
        {/* Discussion Feed */}
        <div className="space-y-6">
          {discussions.map(discussion => <div key={discussion.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {discussion.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {discussion.author}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {discussion.time}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {discussion.subject}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {discussion.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{discussion.content}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <ThumbsUpIcon className="w-4 h-4" />
                      {discussion.likes}
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <MessageSquareIcon className="w-4 h-4" />
                      {discussion.replies} replies
                    </button>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}
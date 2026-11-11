import React, { useState } from 'react';
import {
  MessageSquareIcon,
  ThumbsUpIcon,
  SendIcon,
  AlertCircleIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function Community() {
  const [newPost, setNewPost] = useState('');
  const discussions = [
    {
      id: 1,
      author: 'Sarah M.',
      subject: 'Mathematics',
      title: 'Need help with integration by parts',
      content:
        "Can someone explain the steps for integration by parts? I'm stuck on the practice problems.",
      likes: 12,
      replies: 5,
      time: '2 hours ago'
    },
    {
      id: 2,
      author: 'John K.',
      subject: 'Physics',
      title: 'Great resource for motion problems',
      content:
        'Found this amazing video that helped me understand projectile motion better. Anyone else struggling with this?',
      likes: 8,
      replies: 3,
      time: '5 hours ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-1 text-[#16211E]">
            Community Space
          </h1>
          <p className="text-[#5C6663]">
            Collaborate with fellow students, share study notes, and discuss topics
          </p>
        </div>
        <Button variant="accent" size="sm">
          <AlertCircleIcon className="w-4 h-4 mr-2" />
          Raise a Ticket
        </Button>
      </div>

      {/* New Post */}
      <Card>
        <h2 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
          Start a Discussion
        </h2>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts, ask questions, or help others..."
          className="w-full p-4 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl resize-none focus:outline-none focus:border-[#134E4A] transition-colors text-[#16211E]"
          rows={4}
        />
        <div className="flex justify-end mt-4">
          <Button variant="primary" size="md">
            <SendIcon className="w-4 h-4 mr-2" />
            Post Discussion
          </Button>
        </div>
      </Card>

      {/* Discussion Feed */}
      <div className="space-y-4">
        {discussions.map((discussion, idx) => (
          <Card key={discussion.id}>
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 ${
                  idx % 2 === 0 ? 'bg-[#134E4A]' : 'bg-[#C85A28]'
                } rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
              >
                {discussion.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-[#16211E]">
                    {discussion.author}
                  </span>
                  <span className="text-xs text-[#8A9490]">•</span>
                  <span className="text-xs text-[#5C6663]">
                    {discussion.time}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#E8F1EF] text-[#134E4A] font-semibold text-xs rounded-full">
                    {discussion.subject}
                  </span>
                </div>
                <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-2">
                  {discussion.title}
                </h3>
                <p className="text-[#3B4744] mb-4">{discussion.content}</p>
                <div className="flex items-center gap-6 text-sm text-[#5C6663]">
                  <button className="flex items-center gap-2 hover:text-[#134E4A] font-medium transition-colors">
                    <ThumbsUpIcon className="w-4 h-4" />
                    {discussion.likes}
                  </button>
                  <button className="flex items-center gap-2 hover:text-[#134E4A] font-medium transition-colors">
                    <MessageSquareIcon className="w-4 h-4" />
                    {discussion.replies} replies
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
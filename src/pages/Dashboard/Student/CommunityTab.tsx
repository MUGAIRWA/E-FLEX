import React, { useState } from 'react';
import {
  MessageSquareIcon,
  ThumbsUpIcon,
  SendIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
// @ts-ignore
import { useAuth } from '../../../contexts/AuthContext';
// @ts-ignore
import { SUBJECTS } from '../../../constants/subjects';

export function Community() {
  const { user } = useAuth();
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(SUBJECTS?.[0] || 'Mathematics');
  const [newPost, setNewPost] = useState('');
  const [discussions, setDiscussions] = useState<any[]>([]);

  const handlePostDiscussion = () => {
    if (!newPost.trim()) return;
    const authorName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Student';
    setDiscussions((prev) => [
      {
        id: Date.now(),
        author: authorName,
        subject: newSubject,
        title: newTitle.trim() || 'Study Discussion',
        content: newPost.trim(),
        likes: 0,
        replies: 0,
        time: 'Just now'
      },
      ...prev
    ]);
    setNewTitle('');
    setNewPost('');
  };

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
      </div>

      {/* New Post */}
      <Card>
        <h2 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
          Start a Discussion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Discussion topic / title..."
            className="sm:col-span-2 px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl focus:outline-none focus:border-[#134E4A] transition-colors text-[#16211E]"
          />
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl focus:outline-none focus:border-[#134E4A] transition-colors text-[#16211E]"
          >
            {(SUBJECTS || ['Mathematics', 'English', 'Chemistry']).map(
              (subj: string) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              )
            )}
          </select>
        </div>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts, ask questions, or help others..."
          className="w-full p-4 border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white rounded-xl resize-none focus:outline-none focus:border-[#134E4A] transition-colors text-[#16211E]"
          rows={4}
        />
        <div className="flex justify-end mt-4">
          <Button variant="primary" size="md" onClick={handlePostDiscussion}>
            <SendIcon className="w-4 h-4 mr-2" />
            Post Discussion
          </Button>
        </div>
      </Card>

      {/* Discussion Feed */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <MessageSquareIcon className="w-8 h-8 text-[#8A9490] mx-auto mb-2" />
              <p className="font-semibold text-[#16211E]">
                No community discussions yet
              </p>
              <p className="text-xs text-[#5C6663] mt-1">
                Start the first discussion above to collaborate with classmates!
              </p>
            </div>
          </Card>
        ) : (
          discussions.map((discussion, idx) => (
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
          ))
        )}
      </div>
    </div>
  );
}

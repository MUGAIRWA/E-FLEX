import React, { useEffect, useState } from 'react';
import { SparklesIcon } from 'lucide-react';

const quotes = [
  {
    text: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela'
  },
  {
    text: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King'
  },
  {
    text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    author: 'Mahatma Gandhi'
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: 'Dr. Seuss'
  },
  {
    text: 'Education is not preparation for life; education is life itself.',
    author: 'John Dewey'
  }
];

export function QuoteCard() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="bg-[#134E4A] text-white rounded-2xl p-6 sm:p-7 border border-[#0E3B38] shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#C85A28] flex items-center justify-center shadow-sm">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#F59E0B] mb-1">
            Daily Reflection
          </span>
          <p className="font-poppins text-base sm:text-lg font-medium text-white leading-relaxed mb-2">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-sm text-[#D0E2DE] font-medium">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
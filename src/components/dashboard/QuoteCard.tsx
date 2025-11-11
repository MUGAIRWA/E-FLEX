import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { Card } from '../ui/Card';
const quotes = [{
  text: 'Education is the most powerful weapon which you can use to change the world.',
  author: 'Nelson Mandela'
}, {
  text: 'The beautiful thing about learning is that no one can take it away from you.',
  author: 'B.B. King'
}, {
  text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
  author: 'Mahatma Gandhi'
}, {
  text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
  author: 'Dr. Seuss'
}, {
  text: 'Education is not preparation for life; education is life itself.',
  author: 'John Dewey'
}];
export function QuoteCard() {
  const [quote, setQuote] = useState(quotes[0]);
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);
  return <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-poppins font-semibold text-lg mb-2 text-gray-800">
            Daily Motivation
          </h3>
          <p className="text-gray-700 italic mb-2">"{quote.text}"</p>
          <p className="text-sm text-gray-600 font-medium">— {quote.author}</p>
        </div>
      </div>
    </Card>;
}
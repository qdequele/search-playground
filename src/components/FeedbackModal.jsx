'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Smile, Meh, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FeedbackModal({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(null);

  const handleSendFeedback = async () => {
    const data = {
      feedback,
      rating,
    };

    // Replace with your Notion API call
    const notionResponse = await fetch('/api/sendFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (notionResponse.ok) {
      console.log('Feedback sent:', data);
      onClose();
    } else {
      console.error('Failed to send feedback');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="4"
            placeholder="Enter your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex justify-around mb-4">
            <button onClick={() => setRating('happy')} aria-label="Happy">
              <Smile className={`h-8 w-8 ${rating === 'happy' ? 'text-yellow-500' : 'text-gray-500'}`} />
            </button>
            <button onClick={() => setRating('neutral')} aria-label="Neutral">
              <Meh className={`h-8 w-8 ${rating === 'neutral' ? 'text-yellow-500' : 'text-gray-500'}`} />
            </button>
            <button onClick={() => setRating('unhappy')} aria-label="Unhappy">
              <Frown className={`h-8 w-8 ${rating === 'unhappy' ? 'text-yellow-500' : 'text-gray-500'}`} />
            </button>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={handleSendFeedback} className="w-full">Send Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import Avatar from './Avatar';

interface LeftBubbleProps {
  sender: string;
  message: string;
  senderId: string;
}

const LeftBubble: React.FC<LeftBubbleProps> = ({ sender, message, senderId }) => {
  return (
    <div className='chat chat-start'>
      <div className='chat-image avatar'>
        <div className='w-10 rounded-full'>
          <Avatar seed={senderId} />
        </div>
      </div>
      <div className='chat-header py-1 px-3'>
        {sender}
      </div>
      <div className='chat-bubble shadow-sm text-md text-white font-medium'>
        <p className='white-space: pre-wrap'>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LeftBubble;

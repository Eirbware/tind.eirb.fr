import React, { useState } from 'react';
import Avatar from './Avatar';

interface RightBubbleProps {
  sender: string;
  message: string;
  senderId: string;
  onEdit?: (newMessage: string) => void;
  canEdit?: boolean;
}

const RightBubble: React.FC<RightBubbleProps> = ({
  sender,
  message,
  senderId,
  onEdit,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedMessage.trim() && onEdit) {
      onEdit(editedMessage.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className='chat chat-end'>
      <div className='chat-image avatar'>
        <div className='w-10 rounded-full'>
          <Avatar seed={senderId} />
        </div>
      </div>
      <div className='chat-header py-1 px-3'>
        {sender}
      </div>
      <div className='relative group'>
        <div className='chat-bubble shadow-sm text-md bg-white/80 backdrop-blur-sm text-gray-800 font-medium'>
          {isEditing ? (
            <div className='flex flex-col gap-2'>
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className='bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600 p-1 resize-none'
                autoFocus
              />
              <div className='flex gap-2 justify-end'>
                <button
                  onClick={handleSave}
                  className='text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600'
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className='text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600'
                >
                  ✗
                </button>
              </div>
            </div>
          ) : (
            <p className='white-space: pre-wrap'>
              {message}
            </p>
          )}
        </div>

        {!isEditing && canEdit && onEdit && (
          <button
            onClick={handleEdit}
            className='absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md'
            title="Modifier le message"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
};

export default RightBubble;
import React, { useState, useEffect } from 'react';

let notificationCallback: ((message: string) => void) | null = null;

export const Notification: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    notificationCallback = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 7500); 
    };
    return () => {
      notificationCallback = null;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 8000); 

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md z-50 min-w-[200px] max-w-[80vw] transform transition-transform duration-500 ease-in-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {message}
    </div>
  );
};

export const notify = (message: string) => {
  if (notificationCallback) {
    notificationCallback(message);
  }
};

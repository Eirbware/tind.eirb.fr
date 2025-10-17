import React from 'react';
import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';

interface AvatarProps {
  seed: string;
}

const Avatar: React.FC<AvatarProps> = ({ seed }) => {
  const avatar = createAvatar(funEmoji, {
    seed: seed,
    radius: 50,
    mouth: [
      'plain',
      'lilSmile',
      'cute',
      'wideSmile',
      'smileTeeth',
      'smileLol',
      'tongueOut',
      'faceMask',
    ],
  });

  return (
    <div
      className="w-full h-full aspect-square object-cover"
      dangerouslySetInnerHTML={{ __html: avatar }}
    ></div>
  );
};

export default Avatar;


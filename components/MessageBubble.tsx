
import React from 'react';
import { Message } from '../types';
import Button from './Button';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm break-words border ${
            isAI
              ? 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
              : 'bg-gray-900 text-white border-gray-900 rounded-tr-none'
          }`}
        >
          {message.parts.map((part, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-3' : ''}>
              {part.text && (
                <p className="whitespace-pre-wrap">
                  {part.text}
                </p>
              )}
              {part.button && (
                <div className="mt-2">
                  <Button 
                    label={part.button.label} 
                    url={part.button.url} 
                    type={part.button.type} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

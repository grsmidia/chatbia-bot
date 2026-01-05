
import React from 'react';
import { Message } from '../types';
import Button from './Button';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex w-full mb-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        {isAI && (
          <span className="text-[10px] text-gray-500 mb-1 ml-2 font-bold uppercase tracking-tight">
            Bia
          </span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed text-left shadow-sm ${
            isAI
              ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              : 'bg-gray-800 text-white rounded-tr-none'
          }`}
        >
          {message.parts.map((part, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-3' : ''}>
              {part.text && (
                <p className="whitespace-pre-wrap break-words">
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

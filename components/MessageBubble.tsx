
import React from 'react';
import { Message } from '../types';
import Button from './Button';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`} style={{ margin: '8px 0' }}>
      <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`} style={{ maxWidth: '85%' }}>
        {isAI && (
          <span className="text-[10px] text-gray-400 mb-1 ml-1 font-bold uppercase tracking-widest">
            Bia
          </span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm break-words border ${
            isAI
              ? 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
              : 'bg-gray-900 text-white border-gray-900 rounded-tr-none'
          }`}
          style={{ width: 'fit-content', minWidth: '40px' }}
        >
          {message.parts.map((part, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-3' : ''}>
              {part.text && (
                <p className="whitespace-pre-wrap" style={{ margin: 0 }}>
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

import { useRef, useEffect } from 'react';
import useChatContext from '../Base/ChatProvider/useChatContext/useChatContext';
import { Icon } from '../Icon';
import { ChatMessage } from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import MediaMessage from './ChatMediaMessage/ChatMediaMessage';

export interface ChatProps {
  close?: () => void;
  currentUser: string;
  otherUser: string;
  userRole: string;
  inputPlaceholder?: string;
  showHeader?: boolean;
  userId: string;
}

export const Chat = ({ inputPlaceholder, showHeader, currentUser, userId , userRole, otherUser }: ChatProps) => {

  const messageListRef = useRef(null);
  const { messages, isChatWindowOpen, setIsChatWindowOpen, conversation } = useChatContext();

  // Scrolls to the bottom of the dummy div in chat
  useEffect(() => {
    if (isChatWindowOpen) {
      messageListRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [isChatWindowOpen, messages]);

  return (
    <>
      <div className="relative flex flex-col items-center h-full w-full">
        {showHeader && (
          <div className="relative bg-primary text-white rounded-t p-2 text-center w-full">
            Chat with {otherUser}
            {isChatWindowOpen && (
              <button
                className="absolute right-3"
                type="button"
                onClick={() => setIsChatWindowOpen(!isChatWindowOpen)}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        )}
        <div className="bg-white flex-grow w-full p-3 overflow-auto pb-16 mb-2">
          {messages.map((message, i) => {
            if (message.type === 'text') {
              return <ChatMessage 
                        key={i} 
                        isSelf={message.author === userId ? true : false} 
                        name={(message.author === userId) && currentUser ? currentUser : otherUser} 
                        content={message.body}
                        role={userRole}
                    />
            }
            if (message.type === 'media') {
              return <MediaMessage
                      key={i} 
                      media={message.attachedMedia}
                      isSelf={message.author === userId ? true : false}
                      name={(message.author === userId) && currentUser ? currentUser : otherUser}
                    />
            }
          })}
          <div className="bottom-scroll" ref={messageListRef} />
        </div>
        <ChatInput conversation={conversation} isChatWindowOpen={isChatWindowOpen} inputPlaceholder={inputPlaceholder}/>
      </div>
    </>
  );
};

import { useRef, useEffect, useState } from 'react';
import useChatContext from '../Base/ChatProvider/useChatContext/useChatContext';
import { Icon } from '../Icon';
import { ChatMessage } from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import MediaMessage from './ChatMediaMessage/ChatMediaMessage';
import { ChatUser } from '../../interfaces';
import { STORAGE_CHAT_USERS_KEY } from '../../constants';
import clientStorage from '../../services/clientStorage';



export interface ChatProps {
  close?: () => void;
  otherUser: string;
  users: ChatUser[];
  userRole: string;
  inputPlaceholder?: string;
  showHeader?: boolean;
  userId: string;
}

export const Chat = ({ inputPlaceholder, showHeader, users, userId , userRole, otherUser, close }: ChatProps) => {

  const messageListRef = useRef(null);
  const { messages, isChatWindowOpen, setIsChatWindowOpen, conversation } = useChatContext();
  const [storedUsers, setStoredUsers] = useState<ChatUser[]>([]);
 
  // Scrolls to the bottom of the dummy div in chat
  useEffect(() => {
    if (isChatWindowOpen) {
      messageListRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [isChatWindowOpen, messages]);

  // get current users and save to storage to have names after users disconnected
  useEffect(() => {
    clientStorage.getFromStorage(STORAGE_CHAT_USERS_KEY, []).then((stored: ChatUser[]) => {
        const updatedUsers = stored.map(su => ({...su, ...users.find(u => u.id === su.id)}));
        users.forEach(user => {
          if(!updatedUsers.find(u=>u.id === user.id)) {
            updatedUsers.push(user);
          }
        });
    
        setStoredUsers(updatedUsers);
        
        clientStorage.saveToStorage(STORAGE_CHAT_USERS_KEY, updatedUsers);
      });
  }, [users]);

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
                onClick={() => close ? close() : setIsChatWindowOpen(!isChatWindowOpen)}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        )}
        <div className="bg-white flex-grow w-full p-3 overflow-auto pb-16 mb-2">
          {messages.map((message, i) => {
            if (message.type === 'text') {
              return  storedUsers && <ChatMessage  
                        key={i} 
                        isSelf={message.author === userId ? true : false} 
                        name={(storedUsers.find(u => message.author === u.id)?.name)} 
                        content={message.body}
                        role={userRole}
                    />
            }
            if (message.type === 'media') {
              return <MediaMessage
                      key={i} 
                      media={message.attachedMedia}
                      isSelf={message.author === userId ? true : false}
                      name={(storedUsers.find(u => message.author === u.id)?.name)} 
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

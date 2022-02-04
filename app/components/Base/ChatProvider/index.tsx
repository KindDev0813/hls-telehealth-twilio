import React, { createContext, useEffect, useState, useRef, useCallback } from 'react';
import { Conversation, Message } from '@twilio/conversations';
import { Client } from '@twilio/conversations';
import useVideoContext from '../VideoProvider/useVideoContext/useVideoContext';

type ChatContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  connect: (token: string) => void;
  hasUnreadMessages: boolean;
  messages: Message[];
  conversation: Conversation | null;
};

export const ChatContext = createContext<ChatContextType>(null!);

export const ChatProvider: React.FC = ({children}) => {
  const { room, onError } = useVideoContext();
  const [isChatWindowOpen, setIsChatWindowOpen] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);
  const [chatClient, setChatClient] = useState<Client>(null);
  const isChatWindowOpenRef = useRef(false);

  const connect = useCallback(
    (token: string) => {
      const chatClient = new Client(token);
      //@ts-ignore
      window.chatClient = chatClient;
      setChatClient(chatClient);
    },
    [],
  );

  // useEffect to handle addition of messages
  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: Message) => setMessages(prevMessages => [...prevMessages, message]);
      conversation.getMessages().then(newMessages => setMessages(newMessages.items));
      conversation.on('messageAdded', handleMessageAdded);
      return () => {
        conversation.off('messageAdded', handleMessageAdded);
      }
    }
  }, [conversation]);

  // Handle setting unread Messages
  useEffect(() => {
    if (!isChatWindowOpenRef.current && messages.length) {
      setHasUnreadMessages(true);
    }
  }, [messages]);

  // Handles the viewing of unread messages
  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen;
    if (isChatWindowOpen) setHasUnreadMessages(false);
  }, [isChatWindowOpen]);

  useEffect(() => {
    if (room && chatClient) {
      chatClient.getConversationByUniqueName(room.sid)
      .then(newConversation => {
        //@ts-ignore
        window.chatConversation = newConversation;
        setConversation(newConversation);
      }).catch(() => {
        onError(new Error('Error getting conversation for this room'));
      });
    }
  }, [room, chatClient, onError]);

  return (
    <ChatContext.Provider value={{ isChatWindowOpen, setIsChatWindowOpen, hasUnreadMessages, connect, messages, conversation }}>
      {children}
    </ChatContext.Provider>
  )
}


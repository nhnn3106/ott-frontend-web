import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConversationsSidebar, ChatArea } from '../components/HomePage';
import type { Conversation, Message } from '../components/HomePage';
import { mockConversations, mockMessages } from '../data/mockData';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsSidebarOpen(false);
    // TODO: Fetch messages for selected conversation from API
    // For now, using mock data
    setMessages(mockMessages);
  };

  const handleSendMessage = (content: string) => {
    if (!user || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages((prev) => [...prev, newMessage]);

    // TODO: Send message to API
    console.log('Sending message:', newMessage);
  };

  const handleNewChat = () => {
    console.log('New chat clicked');
    // TODO: Implement new chat functionality
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Conversations Sidebar */}
      <ConversationsSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Chat Area */}
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        currentUserId={user.id}
        onSendMessage={handleSendMessage}
      />

      {/* Mobile Menu Button */}
      {!selectedConversation && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-10"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
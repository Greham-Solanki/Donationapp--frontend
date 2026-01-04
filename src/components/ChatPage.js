import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../utils/api';
import './ChatPage.css';
import { SocketContext } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatPage = ({ currentUserId }) => {
  const { chatGroupId } = useParams(); // Get chatGroupId from URL
  const [chatGroups, setChatGroups] = useState([]);
  const [selectedChatGroupId, setSelectedChatGroupId] = useState(chatGroupId || null); // Use chatGroupId from URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useContext(SocketContext);
  const messagesEndRef = useRef(null);

  // Fetch chat groups
  useEffect(() => {
    const fetchChatGroups = async () => {
      try {
        const response = await apiGet(`http://${API_URL}/api/chats/user/${currentUserId}`);
        console.log('📱 Fetched chat groups:', response);
        setChatGroups(response);
        
        // If chatGroupId is in URL but not selected, select it
        if (chatGroupId && !selectedChatGroupId) {
          setSelectedChatGroupId(chatGroupId);
        }
      } catch (error) {
        console.error("❌ Error fetching chat groups:", error);
      }
    };

    if (currentUserId) {
      fetchChatGroups();
    }
  }, [currentUserId, chatGroupId, selectedChatGroupId]);

  // Handle chat group selection and socket events
  useEffect(() => {
    if (!selectedChatGroupId) return;

    console.log('📱 Joining chat group:', selectedChatGroupId);
    socket.emit('joinChatGroup', selectedChatGroupId);

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await apiGet(`http://${API_URL}/api/chats/messages/${selectedChatGroupId}`);
        console.log('📖 Fetched messages:', response);
        setMessages(response);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };
    fetchMessages();

    // Listen for new messages
    const handleNewMessage = (messageData) => {
      console.log('📨 Received new message:', messageData);
      
      setMessages((prevMessages) => {
        // Check if message already exists (avoid duplicates)
        const exists = prevMessages.some(msg => 
          msg._id === messageData._id || 
          (msg.content === messageData.content && 
           msg.sender === messageData.sender && 
           Math.abs(new Date(msg.createdAt) - new Date(messageData.createdAt)) < 1000)
        );
        
        if (exists) {
          console.log('⚠️ Duplicate message detected, skipping');
          return prevMessages;
        }
        
        console.log('✅ Adding new message to state');
        return [...prevMessages, messageData];
      });
    };

    socket.on('messageReceived', handleNewMessage);

    // Cleanup
    return () => {
      console.log('👋 Leaving chat group:', selectedChatGroupId);
      socket.emit('leaveChatGroup', selectedChatGroupId);
      socket.off('messageReceived', handleNewMessage);
    };
  }, [selectedChatGroupId, socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('📤 Sending message...');

    try {
      // Save message to database first
      const response = await apiPost(`http://${API_URL}/api/chats/messages`, {
        chatGroupId: selectedChatGroupId,
        senderId: currentUserId,
        content: newMessage,
      });

      console.log('✅ Message saved to DB:', response);

      const messageData = {
        _id: response.messageId,
        chatGroupId: selectedChatGroupId,
        sender: currentUserId,
        content: newMessage,
        createdAt: new Date(),
      };

      // Broadcast via socket to all users in the room
      socket.emit('sendMessage', messageData);
      console.log('✅ Message broadcast via socket');

      setNewMessage('');
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper function to check if sender is current user
  const isOwnMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === currentUserId;
  };

  return (
    <div className="chat-page">
      <div className="chat-list">
        <h2>Chats</h2>
        {chatGroups.length > 0 ? (
          chatGroups.map((chatGroup) => (
            <div
              key={chatGroup._id}
              onClick={() => setSelectedChatGroupId(chatGroup._id)}
              className={selectedChatGroupId === chatGroup._id ? 'chat-item active' : 'chat-item'}
            >
              <div className="chat-item-name">{chatGroup.groupName}</div>
              {chatGroup.lastMessage && (
                <div className="chat-item-preview">
                  {chatGroup.lastMessage.substring(0, 50)}
                  {chatGroup.lastMessage.length > 50 ? '...' : ''}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No chats available.</p>
        )}
      </div>
      
      <div className="chat-messages">
        {selectedChatGroupId ? (
          <>
            <div className="messages">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${isOwnMessage(msg) ? 'own' : 'received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>
                  No messages yet. Start the conversation!
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: '#999'
          }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
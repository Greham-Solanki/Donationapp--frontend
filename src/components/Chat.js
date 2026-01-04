// Chat.js

import React, { useState } from 'react';
import { apiPost } from '../utils/api';
import { toast } from 'react-toastify';
import './Chat.css';
import { SocketContext } from '../App'; // Import SocketContext     

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


const Chat = ({ userId, donorId, donationId }) => {
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const socket = useContext(SocketContext);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: userId,
      content: newMessage,  // Changed `message` to `content`
      donationId,
    };

    console.log("Message data being sent:", messageData);

    try {
      const response = await apiPost(`${API_URL}/api/chats/send`, messageData);
      console.log("Response from API:", response);
      if (response) {

        const newMsgData = {
          sender: userId,
          content: newMessage,  // Changed `message` to `content`
          donationId,
          chatGroupId: response.chatGroupId, // Assuming the chatGroupId is returned in the response
        };

        setNewMessage('');
        setError('');
        toast('Message sent!');

        socket.emit('sendMessage', newMsgData);
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="chat-container">
      <h3>Contact Donor</h3>
      {error && <p className="error-message">{error}</p>}
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={handleSendMessage} disabled={!newMessage.trim()}>Send</button>
    </div>
  );
};

export default Chat;

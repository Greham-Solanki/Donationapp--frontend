import React, { useState, useEffect, createContext, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import DonationForm from './components/DonationForm';
import DonationList from './components/DonationList';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import DonationDetails from './components/DonationDetails';
import ChatPage from './components/ChatPage';
//import ChatListPage from './components/ChatListPage';
import MyDonationList from './components/MyDonationList';
import MyDonationDetails from './components/MyDonationDetails';
import io from 'socket.io-client';

export const SocketContext = createContext();

const ProtectedRoute = ({ element, isAuthenticated, userType, requiredType }) => {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userType !== requiredType) return <Navigate to="/" />;
  return element;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [donationId, setDonationId] = useState(null);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize socket connection - use useMemo to prevent recreation
  const socket = useMemo(() => {
    if (!user?.id) return null;

    console.log('🔌 Creating socket connection for user:', user.id);
    
    const newSocket = io(process.env.REACT_APP_API_URL, {
      query: { userId: user.id },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    return newSocket;
  }, [user?.id]); // Only recreate when user.id changes

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('messageReceived', (messageData) => {
      console.log('📨 Global message received:', messageData);
      // This is handled in ChatPage.js for active chats
      // Here we just update notifications for inactive chats
    });

    socket.on('newNotification', (notificationData) => {
      console.log('🔔 New notification received:', notificationData);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          sender: notificationData.sender,
          content: notificationData.message,
          chatGroupId: notificationData.chatGroupId,
          timestamp: new Date(),
        },
      ]);
    });

    // Cleanup on unmount or when socket changes
    return () => {
      console.log('🔌 Cleaning up socket listeners');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('messageReceived');
      socket.off('newNotification');
    };
  }, [socket]);

  // Disconnect socket on logout
  useEffect(() => {
    return () => {
      if (socket && !user) {
        console.log('🔌 Disconnecting socket due to logout');
        socket.disconnect();
      }
    };
  }, [socket, user]);

  const handleLogin = (userData) => {
    console.log('👤 User logged in:', userData.id);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    console.log('👋 User logging out');
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    localStorage.removeItem('user');
  };

  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <Navbar
          isAuthenticated={isAuthenticated}
          userType={user?.userType}
          onLogout={handleLogout}
          donorId={user?.id}
          donationId={donationId}
          notificationCount={notifications.length}
        />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/donate"
            element={
              <ProtectedRoute
                element={<DonationForm />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType="donor"
              />
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute
                element={<DonationList currentUserId={user?.id} userType="donee" />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType="donee"
              />
            }
          />
          <Route
            path="/mydonations"
            element={
              <ProtectedRoute
                element={<MyDonationList />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType="donor"
              />
            }
          />
          <Route
            path="/mydonationdetails/:donationId"
            element={
              <ProtectedRoute
                element={<MyDonationDetails currentUserId={user?.id} setDonationId={setDonationId} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType="donor"
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                element={<Profile user={user} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType={user?.userType}
              />
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                element={<Notifications userId={user?.id} notifications={notifications} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType={user?.userType}
              />
            }
          />
          <Route
            path="/donation/:donationId"
            element={
              <ProtectedRoute
                element={<DonationDetails currentUserId={user?.id} setDonationId={setDonationId} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType={user?.userType}
              />
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute
                element={<ChatPage currentUserId={user?.id} notifications={notifications} setNotifications={setNotifications} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType={user?.userType}
              />
            }
          />
          <Route
            path="/chat/:chatGroupId"
            element={
              <ProtectedRoute
                element={<ChatPage currentUserId={user?.id} notifications={notifications} setNotifications={setNotifications} />}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                requiredType={user?.userType}
              />
            }
          />
        </Routes>
      </Router>
    </SocketContext.Provider>
  );
};

export default App;
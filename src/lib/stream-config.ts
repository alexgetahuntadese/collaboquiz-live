// Stream Video Configuration
export const STREAM_API_KEY = 'mmhfdzb5evj2';
export const STREAM_SECRET = 'wjkpdkxjytb4w68gz5sfpbueu5hq46anyjqu94ybb6gzgstkq6wukf6uef5a3hzr';

// Sample users for demo
export const DEMO_USERS = {
  student1: {
    id: 'student1',
    name: 'You',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  student2: {
    id: 'student2', 
    name: 'Study Partner',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
};

// Generate proper JWT token using the secret
export const generateToken = (userId: string): string => {
  try {
    // Import jwt dynamically to avoid issues with Node.js in browser
    const jwt = require('jsonwebtoken');
    
    const payload = {
      user_id: userId,
      iss: 'stream-io',
      sub: 'user/' + userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };
    
    return jwt.sign(payload, STREAM_SECRET, { algorithm: 'HS256' });
  } catch (error) {
    console.warn('JWT generation failed, using fallback token:', error);
    // Fallback for browser environment
    return `fallback-token-${userId}-${Date.now()}`;
  }
};
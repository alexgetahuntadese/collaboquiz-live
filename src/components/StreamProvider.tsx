import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { STREAM_API_KEY, DEMO_USERS, generateToken } from '@/lib/stream-config';

interface StreamContextType {
  client: StreamVideoClient | null;
  user: User | null;
  isConnected: boolean;
}

const StreamContext = createContext<StreamContextType>({
  client: null,
  user: null,
  isConnected: false,
});

export const useStreamContext = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStreamContext must be used within StreamProvider');
  }
  return context;
};

interface StreamProviderProps {
  children: ReactNode;
  userId?: string;
}

export const StreamProvider = ({ children, userId = 'student1' }: StreamProviderProps) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeStream = async () => {
      try {
        const selectedUser = DEMO_USERS[userId as keyof typeof DEMO_USERS] || DEMO_USERS.student1;
        const token = await generateToken(selectedUser.id);

        const streamClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: selectedUser,
          token,
        });

        setClient(streamClient);
        setUser(selectedUser);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to initialize Stream:', error);
        // Set demo mode even if Stream fails
        setUser(DEMO_USERS[userId as keyof typeof DEMO_USERS] || DEMO_USERS.student1);
        setIsConnected(false);
      }
    };

    initializeStream();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [userId]);

  if (!user) {
    return <div>Loading Stream...</div>;
  }

  if (client && isConnected) {
    return (
      <StreamVideo client={client}>
        <StreamContext.Provider value={{ client, user, isConnected }}>
          {children}
        </StreamContext.Provider>
      </StreamVideo>
    );
  }

  // Fallback for demo mode
  return (
    <StreamContext.Provider value={{ client: null, user, isConnected: false }}>
      {children}
    </StreamContext.Provider>
  );
};
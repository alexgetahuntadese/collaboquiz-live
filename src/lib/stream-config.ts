// Stream Video Configuration
export const STREAM_API_KEY = 'mmhfdzb5evj2';
const STREAM_SECRET = 'wjkpdkxjytb4w68gz5sfpbueu5hq46anyjqu94ybb6gzgstkq6wukf6uef5a3hzr';

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

// Browser-compatible JWT generation using Web Crypto API
const base64url = (data: ArrayBuffer | string): string => {
  let bytes: Uint8Array;
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  } else {
    bytes = new Uint8Array(data);
  }
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const generateToken = async (userId: string): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: userId,
    iss: 'stream-io',
    sub: 'user/' + userId,
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(STREAM_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64url(signature)}`;
};

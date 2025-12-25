import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocket, ServerWithIO } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as any;
  if (socket?.server) {
    const server = socket.server as ServerWithIO;
    
    if (!server.io) {
      console.log('Initializing Socket.io server...');
      initializeSocket(server);
    }
  }
  
  res.end();
}

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error('Please enter your email/phone and password');
        }

        const identifier = credentials.identifier.trim();
        console.log('Login attempt with identifier:', identifier);
        
        // Check if identifier is email or phone number
        const isEmail = identifier.includes('@');
        console.log('Is email:', isEmail);
        
        let user;
        if (isEmail) {
          // Login with email
          user = await prisma.user.findUnique({
            where: { email: identifier },
          });
        } else {
          // Login with phone number - normalize phone number
          const normalizedPhone = identifier.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91/, '');
          console.log('Looking for phone:', normalizedPhone);
          
          // Try multiple phone formats
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: identifier },
                { phone: normalizedPhone },
                { phone: `+91${normalizedPhone}` },
                { phone: `91${normalizedPhone}` },
              ]
            },
          });
        }
        
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user || !user.password) {
          throw new Error('No account found with this email/phone');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('Password invalid for user:', user.email);
          throw new Error('Incorrect password');
        }

        if (!user.isActive) {
          throw new Error('Your account has been disabled');
        }
        
        console.log('Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      
      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.image = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async createUser({ user }) {
      // Create wallet for new user
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 100, // Welcome bonus
        },
      });
      
      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to KARIM TRADERS!',
          message: 'Your account has been created successfully. Enjoy ₹100 welcome bonus in your wallet!',
        },
      });
    },
  },
  debug: false,
};

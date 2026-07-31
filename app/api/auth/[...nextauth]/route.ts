import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import sql from '../../db';

// ✅ التكوين
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});

// ✅ التصدير
export default handler;

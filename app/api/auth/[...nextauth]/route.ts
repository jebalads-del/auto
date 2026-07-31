import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { auth } from '@auth/nextjs';

// ✅ استخدم @auth/nextjs
export const { handlers, auth: authInstance, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // الكود الخاص بقاعدة البيانات...
        return true;
      } catch (error) {
        console.error('❌ خطأ:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// ✅ التصدير الصحيح لـ @auth/nextjs
export const GET = handlers.GET;
export const POST = handlers.POST;

import { Auth } from '@auth/core';
import GoogleProvider from '@auth/core/providers/google';
import sql from '../../db';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const existingUser = await sql`
          SELECT * FROM users WHERE email = ${user.email}
        `;
        if (existingUser.length === 0) {
          await sql`
            INSERT INTO users (email, name, role, status)
            VALUES (${user.email}, ${user.name}, 'user', 'active')
          `;
        }
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
};

// ✅ التصدير مع @auth/core
const handler = Auth(authOptions);
export const GET = handler;
export const POST = handler;

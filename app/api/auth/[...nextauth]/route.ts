import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import sql from '../../db';

// ✅ v5 style
export const { handlers, auth, signIn, signOut } = NextAuth({
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
    async session({ session, token }) {
      try {
        const user = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `;
        if (user.length > 0) {
          session.user.id = user[0].id;
        }
        return session;
      } catch (error) {
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// ✅ التصدير الصحيح لـ v5
export const GET = handlers.GET;
export const POST = handlers.POST;

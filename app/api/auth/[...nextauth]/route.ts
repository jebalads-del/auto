import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import sql from '../../../lib/db'; // ✅ المسار الصحيح

export const authOptions = {
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
        console.error('❌ خطأ في تسجيل الدخول بـ Google:', error);
        return false;
      }
    },
    async session({ session }) {
      try {
        const user = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `;
        if (user.length > 0) {
          session.user.id = user[0].id;
        }
        return session;
      } catch (error) {
        console.error('❌ خطأ في جلب الجلسة:', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

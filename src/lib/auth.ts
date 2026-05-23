import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { getDb } from "@/lib/db";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
};

export function getUserByEmail(email: string): UserRow | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT id, email, password_hash, created_at FROM users WHERE email = ?")
    .get(email);
  return row as UserRow | undefined;
}

export function createUser(email: string, password: string): { id: number; email: string } {
  const db = getDb();
  const passwordHash = bcrypt.hashSync(password, 12);
  const createdAt = new Date().toISOString();

  const result = db
    .prepare("INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)")
    .run(email, passwordHash, createdAt);

  return { id: Number(result.lastInsertRowid), email };
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCreds) {
        const parsed = CredentialsSchema.safeParse(rawCreds);
        if (!parsed.success) return null;

        const user = getUserByEmail(parsed.data.email);
        if (!user) return null;

        const ok = verifyPassword(parsed.data.password, user.password_hash);
        if (!ok) return null;

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
};


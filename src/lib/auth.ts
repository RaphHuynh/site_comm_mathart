import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds"
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      // Enrichir la session avec les infos du token
      if (session.user) {
        session.user.id = token.sub;
        session.user.discordId = token.discordId;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = profile.id;
      }
      if (user) {
        token.isAdmin = user.isAdmin;
        token.discordId = user.discordId;
      }
      return token;
    }
  },
  events: {
    async createUser({ user, account, profile }) {
      if (account?.provider === "discord" && profile?.id) {
        // Mettre à jour l'utilisateur avec le discordId
        await prisma.user.update({
          where: { id: user.id },
          data: { discordId: profile.id }
        });
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
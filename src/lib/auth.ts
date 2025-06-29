import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import type { SessionStrategy } from "next-auth";

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
    strategy: "jwt" as SessionStrategy
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
    async createUser() {
      // Mettre à jour l'utilisateur avec le discordId si nécessaire
      // Note: account et profile ne sont pas disponibles dans cet événement
      // Le discordId sera mis à jour via le callback jwt
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
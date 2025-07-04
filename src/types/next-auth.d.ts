declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      discordId: string;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    discordId: string;
    username: string;
    avatar?: string;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string;
    isAdmin: boolean;
  }
} 
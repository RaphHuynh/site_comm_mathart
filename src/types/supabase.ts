export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          discord_id: string | null;
          name: string | null;
          email: string | null;
          email_verified: string | null;
          image: string | null;
          is_admin: boolean;
          is_banned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          discord_id?: string | null;
          name?: string | null;
          email?: string | null;
          email_verified?: string | null;
          image?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          discord_id?: string | null;
          name?: string | null;
          email?: string | null;
          email_verified?: string | null;
          image?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: number;
          title: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          images: string | null;
          author_id: string;
          category_id: number;
          tags: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          images?: string | null;
          author_id: string;
          category_id: number;
          tags?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          images?: string | null;
          author_id?: string;
          category_id?: number;
          tags?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: number;
          content: string;
          author_id: string;
          article_id: number;
          parent_id: number | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          content: string;
          author_id: string;
          article_id: number;
          parent_id?: number | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          content?: string;
          author_id?: string;
          article_id?: number;
          parent_id?: number | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: number;
          user_id: string;
          comment_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          comment_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          comment_id?: number;
          created_at?: string;
        };
      };
      news: {
        Row: {
          id: number;
          title: string;
          content: string;
          excerpt: string | null;
          author_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          excerpt?: string | null;
          author_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: number;
          title: string;
          description: string;
          date: string;
          location: string | null;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          date: string;
          location?: string | null;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          date?: string;
          location?: string | null;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

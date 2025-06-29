import { supabase, supabaseAdmin } from "./supabase";
import type { Database } from "../types/supabase";

type Tables = Database["public"]["Tables"];

// Types pour les tables
export type User = Tables["users"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Article = Tables["articles"]["Row"];
export type Comment = Tables["comments"]["Row"];
export type CommentLike = Tables["comment_likes"]["Row"];
export type News = Tables["news"]["Row"];
export type Event = Tables["events"]["Row"];

// Services pour les utilisateurs
export const userService = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  },

  async create(user: Omit<User, "id" | "created_at">): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async banUser(id: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ is_banned: true })
      .eq("id", id);

    if (error) throw error;
  },

  async unbanUser(id: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ is_banned: false })
      .eq("id", id);

    if (error) throw error;
  },
};

// Services pour les catégories
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  async getById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(
    category: Omit<Category, "id" | "created_at" | "updated_at">
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Services pour les articles
export const articleService = {
  async getAll(published: boolean = true): Promise<Article[]> {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:users(name, image),
        category:categories(name, color)
      `
      )
      .eq("published", published)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number): Promise<Article | null> {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:users(name, image),
        category:categories(name, color)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(
    article: Omit<Article, "id" | "created_at" | "updated_at">
  ): Promise<Article> {
    const { data, error } = await supabase
      .from("articles")
      .insert(article)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;
  },
};

// Services pour les commentaires
export const commentService = {
  async getByArticleId(articleId: number): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:users(name, image),
        likes:comment_likes(user_id)
      `
      )
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(
    comment: Omit<Comment, "id" | "created_at" | "updated_at">
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async likeComment(userId: string, commentId: number): Promise<void> {
    const { error } = await supabase
      .from("comment_likes")
      .insert({ user_id: userId, comment_id: commentId });

    if (error) throw error;
  },

  async unlikeComment(userId: string, commentId: number): Promise<void> {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("user_id", userId)
      .eq("comment_id", commentId);

    if (error) throw error;
  },
};

// Services pour les actualités
export const newsService = {
  async getAll(): Promise<News[]> {
    const { data, error } = await supabase
      .from("news")
      .select(
        `
        *,
        author:users(name, image)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number): Promise<News | null> {
    const { data, error } = await supabase
      .from("news")
      .select(
        `
        *,
        author:users(name, image)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(news: Omit<News, "id" | "created_at">): Promise<News> {
    const { data, error } = await supabase
      .from("news")
      .insert(news)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Services pour les événements
export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        author:users(name, image)
      `
      )
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(
    event: Omit<Event, "id" | "created_at" | "updated_at">
  ): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

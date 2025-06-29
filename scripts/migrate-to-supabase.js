const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateToSupabase() {
  console.log("🚀 Début de la migration vers Supabase...");

  try {
    // Migration des utilisateurs
    console.log("📦 Migration des utilisateurs...");
    const users = await prisma.user.findMany();

    for (const user of users) {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        discord_id: user.discordId,
        name: user.name,
        email: user.email,
        email_verified: user.emailVerified,
        image: user.image,
        is_admin: user.isAdmin,
        is_banned: user.isBanned,
        created_at: user.createdAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration de l'utilisateur ${user.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${users.length} utilisateurs migrés`);

    // Migration des catégories
    console.log("📦 Migration des catégories...");
    const categories = await prisma.category.findMany();

    for (const category of categories) {
      const { error } = await supabase.from("categories").upsert({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        is_active: category.isActive,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration de la catégorie ${category.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${categories.length} catégories migrées`);

    // Migration des articles
    console.log("📦 Migration des articles...");
    const articles = await prisma.article.findMany({
      include: {
        author: true,
        category: true,
      },
    });

    for (const article of articles) {
      const { error } = await supabase.from("articles").upsert({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        featured_image: article.featuredImage,
        images: article.images,
        author_id: article.authorId,
        category_id: article.categoryId,
        tags: article.tags,
        published: article.published,
        created_at: article.createdAt,
        updated_at: article.updatedAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration de l'article ${article.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${articles.length} articles migrés`);

    // Migration des commentaires
    console.log("📦 Migration des commentaires...");
    const comments = await prisma.comment.findMany({
      include: {
        author: true,
        article: true,
      },
    });

    for (const comment of comments) {
      const { error } = await supabase.from("comments").upsert({
        id: comment.id,
        content: comment.content,
        author_id: comment.authorId,
        article_id: comment.articleId,
        parent_id: comment.parentId,
        is_approved: comment.isApproved,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration du commentaire ${comment.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${comments.length} commentaires migrés`);

    // Migration des likes de commentaires
    console.log("📦 Migration des likes de commentaires...");
    const commentLikes = await prisma.commentLike.findMany();

    for (const like of commentLikes) {
      const { error } = await supabase.from("comment_likes").upsert({
        id: like.id,
        user_id: like.userId,
        comment_id: like.commentId,
        created_at: like.createdAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration du like ${like.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${commentLikes.length} likes migrés`);

    // Migration des actualités
    console.log("📦 Migration des actualités...");
    const news = await prisma.news.findMany({
      include: {
        author: true,
      },
    });

    for (const newsItem of news) {
      const { error } = await supabase.from("news").upsert({
        id: newsItem.id,
        title: newsItem.title,
        content: newsItem.content,
        excerpt: newsItem.excerpt,
        author_id: newsItem.authorId,
        created_at: newsItem.createdAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration de l'actualité ${newsItem.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${news.length} actualités migrées`);

    // Migration des événements
    console.log("📦 Migration des événements...");
    const events = await prisma.event.findMany({
      include: {
        author: true,
      },
    });

    for (const event of events) {
      const { error } = await supabase.from("events").upsert({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        author_id: event.authorId,
        created_at: event.createdAt,
        updated_at: event.updatedAt,
      });

      if (error) {
        console.error(
          `❌ Erreur lors de la migration de l'événement ${event.id}:`,
          error
        );
      }
    }
    console.log(`✅ ${events.length} événements migrés`);

    console.log("🎉 Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution de la migration
migrateToSupabase();

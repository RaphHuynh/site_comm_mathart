const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../prisma/mathart.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');
  
  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error connecting to SQLite:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  // Connect to PostgreSQL
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: POSTGRES_URL
      }
    }
  });

  try {
    // Test PostgreSQL connection
    await postgresClient.$connect();
    console.log('✅ Connected to PostgreSQL database');

    // Migrate users
    console.log('📦 Migrating users...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          discordId: user.discord_id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified ? new Date(user.email_verified) : null,
          image: user.image,
          isAdmin: Boolean(user.is_admin),
          isBanned: Boolean(user.is_banned),
          createdAt: new Date(user.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate categories
    console.log('📦 Migrating categories...');
    const categories = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM categories', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const category of categories) {
      await postgresClient.category.upsert({
        where: { id: category.id },
        update: {},
        create: {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
          isActive: Boolean(category.is_active),
          createdAt: new Date(category.created_at),
          updatedAt: new Date(category.updated_at)
        }
      });
    }
    console.log(`✅ Migrated ${categories.length} categories`);

    // Migrate articles
    console.log('📦 Migrating articles...');
    const articles = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM articles', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const article of articles) {
      await postgresClient.article.upsert({
        where: { id: article.id },
        update: {},
        create: {
          id: article.id,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          featuredImage: article.featured_image,
          images: article.images,
          authorId: article.author_id,
          categoryId: article.category_id,
          tags: article.tags,
          published: Boolean(article.published),
          createdAt: new Date(article.created_at),
          updatedAt: new Date(article.updated_at)
        }
      });
    }
    console.log(`✅ Migrated ${articles.length} articles`);

    // Migrate comments
    console.log('📦 Migrating comments...');
    const comments = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM comments', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const comment of comments) {
      await postgresClient.comment.upsert({
        where: { id: comment.id },
        update: {},
        create: {
          id: comment.id,
          content: comment.content,
          authorId: comment.author_id,
          articleId: comment.article_id,
          parentId: comment.parent_id,
          isApproved: Boolean(comment.is_approved),
          createdAt: new Date(comment.created_at),
          updatedAt: new Date(comment.updated_at)
        }
      });
    }
    console.log(`✅ Migrated ${comments.length} comments`);

    // Migrate comment likes
    console.log('📦 Migrating comment likes...');
    const commentLikes = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM comment_likes', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const like of commentLikes) {
      await postgresClient.commentLike.upsert({
        where: { 
          userId_commentId: {
            userId: like.user_id,
            commentId: like.comment_id
          }
        },
        update: {},
        create: {
          userId: like.user_id,
          commentId: like.comment_id,
          createdAt: new Date(like.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${commentLikes.length} comment likes`);

    // Migrate news
    console.log('📦 Migrating news...');
    const news = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM news', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const newsItem of news) {
      await postgresClient.news.upsert({
        where: { id: newsItem.id },
        update: {},
        create: {
          id: newsItem.id,
          title: newsItem.title,
          content: newsItem.content,
          excerpt: newsItem.excerpt,
          authorId: newsItem.author_id,
          createdAt: new Date(newsItem.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${news.length} news items`);

    // Migrate events
    console.log('📦 Migrating events...');
    const events = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM events', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const event of events) {
      await postgresClient.event.upsert({
        where: { id: event.id },
        update: {},
        create: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: new Date(event.date),
          location: event.location,
          authorId: event.author_id,
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at)
        }
      });
    }
    console.log(`✅ Migrated ${events.length} events`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    sqliteDb.close();
    await postgresClient.$disconnect();
  }
}

migrateData(); 
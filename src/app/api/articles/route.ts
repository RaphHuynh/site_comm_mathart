import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les articles avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const published = searchParams.get('published');

    const where: Record<string, unknown> = {};

    // Filtre de recherche
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Filtre par catégorie
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Filtre par auteur
    if (author) {
      where.authorId = author;
    }

    // Filtre par statut de publication
    if (published !== null) {
      where.published = published === 'true';
    }

    // Construire le tri
    const orderBy: Record<string, unknown> = {};
    if (sortBy === 'author') {
      orderBy.author = { name: sortOrder };
    } else if (sortBy === 'category') {
      orderBy.category = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      excerpt, 
      featuredImage,
      images, 
      categoryId, 
      tags, 
      published 
    } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Titre, contenu et catégorie sont requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des articles." },
        { status: 403 }
      );
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        featuredImage,
        images,
        authorId: user.id,
        categoryId,
        tags,
        published: published || false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'article" },
      { status: 500 }
    );
  }
} 
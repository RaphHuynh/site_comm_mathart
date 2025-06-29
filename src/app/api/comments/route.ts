import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les commentaires d'un article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const approvedOnly = searchParams.get('approvedOnly') !== 'false';

    if (!articleId) {
      return NextResponse.json(
        { error: "ID de l'article requis" },
        { status: 400 }
      );
    }

    const where: any = {
      articleId: parseInt(articleId),
      parentId: null, // Seulement les commentaires parents
    };

    if (approvedOnly) {
      where.isApproved = true;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isAdmin: true,
          },
        },
        replies: {
          where: approvedOnly ? { isApproved: true } : {},
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                isAdmin: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau commentaire
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour commenter" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est banni
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.isBanned) {
      return NextResponse.json(
        { error: "Vous avez été banni et ne pouvez plus commenter." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, articleId, parentId } = body;

    if (!content || !articleId) {
      return NextResponse.json(
        { error: "Contenu et ID de l'article requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'article est publié
    if (!article.published) {
      return NextResponse.json(
        { error: "Impossible de commenter un article non publié" },
        { status: 400 }
      );
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Commentaire parent non trouvé" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        articleId: parseInt(articleId),
        parentId: parentId ? parseInt(parentId) : null,
        isApproved: session.user.isAdmin ? true : true, // Les admins sont automatiquement approuvés
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isAdmin: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du commentaire" },
      { status: 500 }
    );
  }
} 
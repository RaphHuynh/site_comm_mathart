import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un commentaire spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
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
          where: { isApproved: true },
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
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Erreur lors de la récupération du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du commentaire" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un commentaire
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, isApproved } = body;

    // Récupérer le commentaire
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isAuthor = existingComment.authorId === session.user.id;
    const isAdmin = session.user.isAdmin;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier ce commentaire" },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {};
    
    if (content !== undefined) {
      updateData.content = content;
    }
    
    // Seuls les admins peuvent changer le statut d'approbation
    if (isApproved !== undefined && isAdmin) {
      updateData.isApproved = isApproved;
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Erreur lors de la modification du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du commentaire" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un commentaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    // Récupérer le commentaire
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isAuthor = existingComment.authorId === session.user.id;
    const isAdmin = session.user.isAdmin;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer ce commentaire" },
        { status: 403 }
      );
    }

    // Supprimer le commentaire (les réponses et likes seront supprimés automatiquement par CASCADE)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Commentaire supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du commentaire" },
      { status: 500 }
    );
  }
} 
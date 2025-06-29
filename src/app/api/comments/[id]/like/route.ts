import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Liker/unliker un commentaire
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour liker un commentaire" },
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

    // Vérifier que le commentaire existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà liké ce commentaire
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId,
        },
      },
    });

    if (existingLike) {
      // Si déjà liké, supprimer le like (unlike)
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: commentId,
          },
        },
      });

      return NextResponse.json({ liked: false, message: "Like supprimé" });
    } else {
      // Si pas liké, ajouter le like
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId: commentId,
        },
      });

      return NextResponse.json({ liked: true, message: "Commentaire liké" });
    }
  } catch (error) {
    console.error("Erreur lors du like/unlike:", error);
    return NextResponse.json(
      { error: "Erreur lors du like/unlike" },
      { status: 500 }
    );
  }
}

// GET - Vérifier si l'utilisateur a liké un commentaire
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ liked: false });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId,
        },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error("Erreur lors de la vérification du like:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du like" },
      { status: 500 }
    );
  }
} 
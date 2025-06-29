import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id);
    
    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!news) {
      return NextResponse.json(
        { error: "Actualité non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'actualité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'actualité" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const newsId = parseInt(id);
    
    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'actualité existe
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!existingNews) {
      return NextResponse.json(
        { error: "Actualité non trouvée" },
        { status: 404 }
      );
    }

    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        title,
        content,
        excerpt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Erreur lors de la modification de l'actualité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'actualité" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const newsId = parseInt(id);
    
    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'actualité existe
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!existingNews) {
      return NextResponse.json(
        { error: "Actualité non trouvée" },
        { status: 404 }
      );
    }

    await prisma.news.delete({
      where: { id: newsId },
    });

    return NextResponse.json({ message: "Actualité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'actualité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'actualité" },
      { status: 500 }
    );
  }
} 
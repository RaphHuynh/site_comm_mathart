import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construire les conditions de filtrage
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { author: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Construire l'ordre de tri
    const orderBy: Record<string, unknown> = {};
    orderBy[sortBy] = sortOrder;

    const news = await prisma.news.findMany({
      where,
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
      orderBy,
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des actualités" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
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
        { error: "Seuls les administrateurs peuvent créer des actualités." },
        { status: 403 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        excerpt,
        authorId: session.user.id,
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

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'actualité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'actualité" },
      { status: 500 }
    );
  }
} 
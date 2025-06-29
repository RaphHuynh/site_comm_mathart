import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer toutes les statistiques en parallèle
    const [
      totalUsers,
      totalArticles,
      totalNews,
      publishedArticles,
      draftArticles,
      adminUsers,
      regularUsers,
      recentUsers,
      recentArticles,
      recentNews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.news.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.article.count({ where: { published: false } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          isAdmin: true,
        }
      }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
            }
          }
        }
      }),
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
            }
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalArticles,
      totalNews,
      publishedArticles,
      draftArticles,
      adminUsers,
      regularUsers,
      recentUsers,
      recentArticles,
      recentNews
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
} 
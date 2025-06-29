import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un article spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
        _count: {
          select: {
            comments: true,
          },
        },
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            likes: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Convertir la chaîne d'images en tableau
    const images = article.images ? article.images.split(',').filter(Boolean) : [];

    return NextResponse.json({
      ...article,
      images,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'article" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
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
        { error: 'Titre, contenu et catégorie sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'article existe et appartient à l'utilisateur ou que l'utilisateur est admin
    const existingArticle = await prisma.article.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    if (existingArticle.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier cet article' },
        { status: 403 }
      );
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Convertir le tableau d'images en chaîne séparée par des virgules
    const imagesString = images && images.length > 0 ? images.join(',') : null;

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (imagesString !== undefined) updateData.images = imagesString;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (tags !== undefined) updateData.tags = tags;
    if (published !== undefined) updateData.published = published;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Convertir la chaîne d'images en tableau pour la réponse
    const responseImages = article.images ? article.images.split(',').filter(Boolean) : [];

    return NextResponse.json({
      ...article,
      images: responseImages,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'article" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'article existe et appartient à l'utilisateur ou que l'utilisateur est admin
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    if (article.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer cet article' },
        { status: 403 }
      );
    }

    // Supprimer l'article (les commentaires seront supprimés automatiquement par CASCADE)
    await prisma.article.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Article supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article" },
      { status: 500 }
    );
  }
} 
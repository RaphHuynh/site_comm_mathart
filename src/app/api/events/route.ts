import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les événements
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        author: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { date: "asc" }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel événement (admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des événements." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { title, description, date, location } = body;
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Titre, description et date sont requis" },
        { status: 400 }
      );
    }
    let parsedDate;
    try {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) throw new Error('Date invalide');
    } catch {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: parsedDate,
        location,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true } }
      }
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error, error?.stack);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur actuel est admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Accès refusé - Admin requis" },
        { status: 403 }
      );
    }

    // Empêcher de se rétrograder soi-même
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous rétrograder vous-même" },
        { status: 400 }
      );
    }

    // Rétrograder l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isAdmin: false },
    });

    return NextResponse.json({ 
      message: "Utilisateur rétrogradé avec succès",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Erreur lors de la rétrogradation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la rétrogradation" },
      { status: 500 }
    );
  }
} 
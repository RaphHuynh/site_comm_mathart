import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.redirect("/admin/users?error=Accès%20réservé%20aux%20administrateurs");
    }
    const { id } = await params;
    const userId = id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.redirect("/admin/users?error=Utilisateur%20non%20trouvé");
    }
    if (user.isAdmin) {
      return NextResponse.redirect("/admin/users?error=Cet%20utilisateur%20est%20déjà%20administrateur");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    });
    return NextResponse.redirect("/admin/users?success=Utilisateur%20promu%20administrateur");
  } catch (error) {
    console.error("Erreur lors de la promotion:", error);
    return NextResponse.redirect("/admin/users?error=Erreur%20lors%20de%20la%20promotion");
  }
} 
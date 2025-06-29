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
      return NextResponse.redirect("/admin/users?error=Impossible%20de%20bannir%20un%20administrateur");
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
    return NextResponse.redirect("/admin/users?success=" + (updated.isBanned ? "Utilisateur%20banni" : "Utilisateur%20débanni"));
  } catch (error) {
    console.error("Erreur lors du bannissement:", error);
    return NextResponse.redirect("/admin/users?error=Erreur%20lors%20du%20bannissement");
  }
} 
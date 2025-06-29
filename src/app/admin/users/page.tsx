import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      discordId: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
      _count: {
        select: {
          articles: true,
          news: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Gérez les membres de votre communauté</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUsersClient users={users} />
        </CardContent>
      </Card>
    </div>
  );
} 
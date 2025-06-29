"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarIcon, UserIcon, CalendarIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  discordId: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
  _count: {
    articles: number;
    news: number;
  };
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Utilisateur</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Rôle</th>
            <th className="text-left py-3 px-4">Contributions</th>
            <th className="text-left py-3 px-4">Date d&apos;inscription</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name || ""}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    {user.discordId && (
                      <div className="text-sm text-gray-500">
                        Discord ID: {user.discordId}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={user.isAdmin ? "default" : "secondary"}>
                  {user.isAdmin ? (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-3 w-3" />
                      <span>Admin</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-3 w-3" />
                      <span>Utilisateur</span>
                    </div>
                  )}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  <div>{user._count.articles} articles</div>
                  <div>{user._count.news} actualités</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  {!user.isAdmin && (
                    <Button
                      variant={user.isBanned ? "destructive" : "outline"}
                      size="sm"
                      disabled={loadingId === user.id}
                      onClick={async () => {
                        setLoadingId(user.id);
                        await fetch(`/api/admin/users/${user.id}/ban`, { method: 'POST' });
                        setLoadingId(null);
                        router.refresh();
                      }}
                    >
                      {user.isBanned ? "Débannir" : "Bannir"}
                    </Button>
                  )}
                  {user.isBanned && (
                    <Badge variant="destructive">Banni</Badge>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
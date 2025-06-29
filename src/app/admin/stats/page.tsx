"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  FileText, 
  Newspaper, 
  TrendingUp, 
  User,
  Crown,
  Loader2
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalArticles: number;
  totalNews: number;
  publishedArticles: number;
  draftArticles: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
    isAdmin: boolean;
  }>;
  recentArticles: Array<{
    id: number;
    title: string;
    published: boolean;
    createdAt: string;
    author: {
      name: string;
    };
  }>;
  recentNews: Array<{
    id: number;
    title: string;
    createdAt: string;
    author: {
      name: string;
    };
  }>;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Erreur lors du chargement des statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-600">Vue d&apos;ensemble de votre site MathArt</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.adminUsers} admins, {stats.regularUsers} utilisateurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedArticles} publiés, {stats.draftArticles} brouillons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actualités</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNews}</div>
            <p className="text-xs text-muted-foreground">
              Total des actualités publiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de publication</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalArticles > 0 
                ? Math.round((stats.publishedArticles / stats.totalArticles) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Articles publiés vs brouillons
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nouveaux utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Nouveaux utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun nouvel utilisateur</p>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.isAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Articles récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Articles récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentArticles.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun article récent</p>
            ) : (
              <div className="space-y-3">
                {stats.recentArticles.slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.title}</p>
                      <p className="text-xs text-gray-500">
                        par {article.author.name} • {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant={article.published ? "default" : "secondary"}>
                      {article.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actualités récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="mr-2 h-5 w-5" />
              Actualités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentNews.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune actualité récente</p>
            ) : (
              <div className="space-y-3">
                {stats.recentNews.slice(0, 5).map((news) => (
                  <div key={news.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{news.title}</p>
                      <p className="text-xs text-gray-500">
                        par {news.author.name} • {new Date(news.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UsersIcon, 
  DocumentTextIcon, 
  NewspaperIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [userCount, articleCount, newsCount, publishedArticles] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.news.count(),
    prisma.article.count({ where: { published: true } })
  ]);

  // Récupérer les derniers articles
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  // Récupérer les derniers utilisateurs
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre site communautaire</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Membres inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articleCount}</div>
            <p className="text-xs text-muted-foreground">
              {publishedArticles} publiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actualités</CardTitle>
            <NewspaperIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsCount}</div>
            <p className="text-xs text-muted-foreground">
              Articles d'actualité
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visites</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              À implémenter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu récent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers articles */}
        <Card>
          <CardHeader>
            <CardTitle>Derniers articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{article.title}</h4>
                    <p className="text-xs text-gray-500">
                      par {article.author.name} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    article.published 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {article.published ? "Publié" : "Brouillon"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Derniers utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Derniers utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{user.name}</h4>
                    <p className="text-xs text-gray-500">
                      {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    user.isAdmin 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.isAdmin ? "Admin" : "Utilisateur"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
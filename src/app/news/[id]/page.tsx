"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from "@/components/layout/Navigation";
import { HybridRenderer } from "@/components/ui/hybrid-renderer";
import { ArrowLeft, Edit, Trash2, Calendar, User, Loader2 } from "lucide-react";

interface News {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export default function NewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Charger l'actualité
  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch(`/api/news/${params.id}`);
        if (response.ok) {
          const newsData = await response.json();
          setNews(newsData);
        } else {
          router.push("/news");
        }
      } catch (error) {
        console.error("Erreur:", error);
        router.push("/news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/news/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/news");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de l'actualité");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>Actualité non trouvée</p>
            <Link href="/news">
              <Button className="mt-4">Retour aux actualités</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/news" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux actualités
          </Link>
        </div>

        {/* Contenu principal */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
                
                {news.excerpt && (
                  <p className="text-lg text-gray-600 italic mb-4">{news.excerpt}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(news.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    {news.author.name}
                  </div>
                </div>
              </div>

              {/* Actions pour les admins */}
              {session?.user?.isAdmin && (
                <div className="flex items-center space-x-2 ml-4">
                  <Link href={`/admin/news/${news.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <HybridRenderer content={news.content} />
            </div>
          </CardContent>
        </Card>

        {/* Informations sur l'auteur */}
        <Card>
          <CardHeader>
            <CardTitle>À propos de l&apos;auteur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={news.author.image || ""} alt={news.author.name || ""} />
                <AvatarFallback className="text-lg">
                  {news.author.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{news.author.name}</h3>
                <p className="text-gray-600">{news.author.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Calendar, User } from "lucide-react";

interface News {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Chargement initial des actualités
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/news");
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des actualités:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleDelete = async (newsId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
      return;
    }

    setDeletingId(newsId);

    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNews(news.filter(item => item.id !== newsId));
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de l'actualité");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Actualités</h1>
          <p className="text-gray-600">Créez et gérez les actualités de votre site</p>
        </div>
        <Link href="/admin/news/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Actualité
          </Button>
        </Link>
      </div>

      {/* Résultats */}
      <div className="mb-4">
        <p className="text-gray-600">
          {news.length} actualité{news.length > 1 ? 's' : ''} trouvée{news.length > 1 ? 's' : ''}
        </p>
      </div>

      {news.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune actualité pour le moment</p>
              <p className="text-sm mt-2 text-gray-400">Les actualités permettront de partager des informations importantes avec la communauté</p>
              <div className="mt-6">
                <Link href="/admin/news/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer la première actualité
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {news.map((newsItem) => (
            <Card key={newsItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={newsItem.author.image || ""} alt={newsItem.author.name || ""} />
                        <AvatarFallback>
                          {newsItem.author.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{newsItem.author.name}</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(newsItem.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{newsItem.title}</h3>
                    {newsItem.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{newsItem.excerpt}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href={`/news/${newsItem.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/news/${newsItem.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(newsItem.id)}
                      disabled={deletingId === newsItem.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
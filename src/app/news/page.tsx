"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/Navigation";
import { Plus, Newspaper, Calendar, User as UserIcon, Loader2, ArrowRight, Clock } from "lucide-react";

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

export default function NewsPage() {
  const { data: session } = useSession();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des actualités...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Actualités <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MathArt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Restez informés des dernières nouvelles de la communauté et des événements à venir.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Newspaper className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{news.length}</p>
                  <p className="text-sm text-gray-600">Actualités publiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {news.filter(n => {
                      const newsDate = new Date(n.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return newsDate >= weekAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">Cette semaine</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(news.map(n => n.author.name)).size}
                  </p>
                  <p className="text-sm text-gray-600">Auteurs actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des actualités */}
        {news.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Newspaper className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune actualité</h3>
                <p className="text-gray-500 mb-6">
                  Aucune actualité n'a encore été publiée.
                </p>
                {session?.user?.isAdmin && (
                  <Link href="/admin/news/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer la première actualité
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((newsItem, index) => (
              <Card 
                key={newsItem.id} 
                className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  {/* En-tête avec auteur */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                          <AvatarImage src={newsItem.author.image || ""} alt={newsItem.author.name || ""} />
                          <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                            {newsItem.author.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{newsItem.author.name}</span>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(newsItem.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold mb-2 line-clamp-2">
                      {newsItem.title}
                    </CardTitle>
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-6">
                    {newsItem.excerpt && (
                      <CardDescription className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                        {newsItem.excerpt}
                      </CardDescription>
                    )}
                    
                    {/* Informations supplémentaires */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-blue-600" />
                        {new Date(newsItem.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {/* Bouton lire */}
                    <Link href={`/news/${newsItem.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group-hover:shadow-lg transition-all duration-300">
                        Lire l'actualité
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Restez informé des actualités
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Suivez nos actualités pour ne manquer aucune information importante 
                sur la communauté et les événements à venir.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-6 py-2 text-base">
                  <Newspaper className="mr-2 h-4 w-4" />
                  Actualités récentes
                </Badge>
                {session?.user?.isAdmin && (
                  <Link href="/admin/news/new">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une actualité
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer className="mt-12 py-6 text-center text-gray-500 text-sm border-t bg-white">
        © {new Date().getFullYear()} MathArt. Tous droits réservés.
      </footer>
    </div>
  );
} 
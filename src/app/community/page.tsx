"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/Navigation";
import { Users, MessageCircle, Calendar, User as UserIcon, Crown, Loader2, FileText, Newspaper, Star } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    articles: number;
    news: number;
  };
}

interface Stats {
  totalArticles: number;
  totalEvents: number;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, totalEvents: 0 });
  const [loading, setLoading] = useState(true);

  // Chargement des utilisateurs et statistiques
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les utilisateurs
        const usersResponse = await fetch("/api/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
        
        // Charger les articles
        const articlesResponse = await fetch("/api/articles");
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          const publishedArticles = articlesData.filter((article: any) => article.published);
          
          // Charger les événements
          const eventsResponse = await fetch("/api/events");
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            
            setStats({
              totalArticles: publishedArticles.length,
              totalEvents: eventsData.length
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement de la communauté...</p>
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
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Communauté <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MathArt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Rejoignez une communauté passionnée de science, chercheurs et amateurs éclairés.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Membres actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
                  <p className="text-sm text-gray-600">Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                  <p className="text-sm text-gray-600">Événements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Membres de la communauté</h2>
              <p className="text-gray-600">Découvrez les passionnés qui font vivre la communauté de Mathart</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {users.length} membre{users.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          {users.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre</h3>
                  <p className="text-gray-500 mb-6">
                    Soyez le premier à rejoindre la communauté !
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Rejoindre la communauté
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user, index) => (
                <Card 
                  key={user.id} 
                  className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                          <AvatarImage src={user.image || ""} alt={user.name || ""} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold">
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {user.isAdmin && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3">
                          Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-blue-600">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{user._count.articles}</span>
                            <span className="text-gray-500">articles</span>
                          </div>
                          <div className="flex items-center space-x-1 text-green-600">
                            <Newspaper className="h-4 w-4" />
                            <span className="font-medium">{user._count.news}</span>
                            <span className="text-gray-500">actualités</span>
                          </div>
                        </div>
                        
                        {user.isAdmin && (
                          <div className="mt-3">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                              <Star className="h-3 w-3 mr-1" />
                              Administrateur
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
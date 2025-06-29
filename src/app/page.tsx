import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/Navigation";
import { FileText, Calendar, Users, ArrowRight, Clock, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Récupérer les événements à venir (limités à 3)
  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date()
      }
    },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      }
    },
    orderBy: { date: "asc" },
    take: 3
  });

  // Récupérer les articles récents publiés (limités à 3)
  const recentArticles = await prisma.article.findMany({
    where: { published: true },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      },
      category: {
        select: { id: true, name: true, color: true, icon: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Fond décoratif subtil */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10">
          {/* Formes géométriques simples */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200 rounded-full blur-xl"></div>
          <div className="absolute top-60 left-1/4 w-40 h-40 bg-purple-200 rounded-full blur-xl"></div>
          <div className="absolute top-80 right-1/3 w-28 h-28 bg-blue-300 rounded-full blur-xl"></div>
          <div className="absolute top-96 left-1/2 w-36 h-36 bg-indigo-300 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-1/4 w-20 h-20 bg-purple-300 rounded-full blur-xl"></div>
          <div className="absolute top-64 left-1/3 w-44 h-44 bg-blue-200 rounded-full blur-xl"></div>
          <div className="absolute top-48 right-1/2 w-16 h-16 bg-indigo-200 rounded-full blur-xl"></div>
        </div>
        
        {/* Symboles mathématiques flottants */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 text-4xl text-blue-400/30 animate-pulse">∫</div>
          <div className="absolute top-40 right-20 text-3xl text-indigo-400/30 animate-pulse delay-1000">∑</div>
          <div className="absolute top-60 left-1/4 text-2xl text-purple-400/30 animate-pulse delay-2000">π</div>
          <div className="absolute top-80 right-1/3 text-5xl text-blue-500/30 animate-pulse delay-3000">∞</div>
          <div className="absolute top-96 left-1/2 text-3xl text-indigo-500/30 animate-pulse delay-1000">√</div>
          <div className="absolute top-32 right-1/4 text-4xl text-purple-500/30 animate-pulse delay-2000">∂</div>
          <div className="absolute top-64 left-1/3 text-2xl text-blue-600/30 animate-pulse delay-3000">∇</div>
          <div className="absolute top-48 right-1/2 text-3xl text-indigo-600/30 animate-pulse delay-1000">∮</div>
        </div>
      </div>

      <Navigation />

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MathArt Community
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Découvrez la beauté des sciences à travers des articles passionnants, 
              des événements enrichissants et une communauté vibrante de passionnés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/articles">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg">
                  <FileText className="mr-2 h-5 w-5" />
                  Explorer les articles
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Voir les événements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Événements à venir */}
      {upcomingEvents.length > 0 && (
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Événements à venir
              </h2>
              <p className="text-gray-600 text-lg">
                Rejoignez-nous pour ces rencontres passionnantes
              </p>
            </div>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group overflow-hidden rounded-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* En-tête avec date */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {new Date(event.date).toLocaleDateString("fr-FR", { 
                          weekday: 'long', 
                          day: '2-digit', 
                          month: 'long' 
                        })}
                      </Badge>
                      <div className="text-sm opacity-90">
                        {new Date(event.date).toLocaleTimeString("fr-FR", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                      {event.title}
                    </h2>
                  </div>
                  {/* Contenu */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                      {event.description}
                    </p>
                    {/* Informations supplémentaires */}
                    <div className="space-y-3">
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2 text-indigo-600" />
                        <span>Organisé par {event.author?.name || 'MathArt'}</span>
                      </div>
                    </div>
                    {/* Badge statut */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {new Date(event.date) >= new Date() ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Clock className="h-3 w-3 mr-1" />
                          À venir
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                          Terminé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/events">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Voir tous les événements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Articles récents */}
      {recentArticles.length > 0 && (
        <div className="relative z-10 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Articles récents
              </h2>
              <p className="text-gray-600 text-lg">
                Découvrez nos dernières publications
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {recentArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl cursor-pointer">
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-2xl"
                      style={{ objectPosition: 'center' }}
                    />
                  )}
                  <div className="flex-1 flex flex-col p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: article.category.color || '#6B7280',
                          color: 'white'
                        }}
                      >
                        {article.category.name}
                      </Badge>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-3 leading-relaxed">
                      {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={article.author.image || ""} alt={article.author.name || ""} />
                        <AvatarFallback className="text-xs">
                          {article.author.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600">{article.author.name}</span>
                    </div>
                    <Link href={`/articles/${article.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group-hover:shadow-lg transition-all duration-300 mt-2">
                        <FileText className="mr-2 h-4 w-4" />
                        Lire l&apos;article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/articles">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Voir tous les articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Section Communauté */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Rejoignez notre communauté
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Connectez-vous avec des passionnés de sciences, partagez vos découvertes 
                et participez à des discussions enrichissantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/community">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Découvrir la communauté
                  </Button>
                </Link>
                {!session && (
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 MathArt. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

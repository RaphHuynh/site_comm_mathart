"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from "@/components/layout/Navigation";
import { SearchFilters, FilterState } from "@/components/ui/search-filters";
import { Calendar, User, Tag, Eye, FileText, Loader2, ArrowRight } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  category: {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
  };
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  featuredImage?: string;
}

export default function ArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  // Chargement initial des articles
  useEffect(() => {
    const loadInitialArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles?sortBy=createdAt&sortOrder=desc&published=true");
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
          
          // Extraire les catégories et auteurs uniques
          const uniqueCategories = [...new Set(data.map((article: Article) => article.category.name))] as string[];
          const uniqueAuthors = [...new Set(data.map((article: Article) => article.author.name))] as string[];
          
          setCategories(uniqueCategories);
          setAuthors(uniqueAuthors);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialArticles();
  }, []);

  // Fonction pour appliquer les filtres localement
  const applyFilters = (filters: FilterState) => {
    let filteredData = [...articles];

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
        article.author.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par catégorie
    if (filters.category && filters.category !== 'all') {
      filteredData = filteredData.filter(article => article.category.name === filters.category);
    }

    // Filtre par auteur
    if (filters.author && filters.author !== 'all') {
      filteredData = filteredData.filter(article => 
        article.author.name.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // Filtre par statut
    if (filters.published === 'true') {
      filteredData = filteredData.filter(article => article.published);
    } else if (filters.published === 'false') {
      filteredData = filteredData.filter(article => !article.published);
    }
    // Si published === 'all', on ne filtre pas

    // Tri
    filteredData.sort((a, b) => {
      let aValue: string | Date, bValue: string | Date;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.name.toLowerCase();
          bValue = b.category.name.toLowerCase();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default: // createdAt
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  };

  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    author: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    published: 'true'
  });

  const filteredArticles = applyFilters(currentFilters);

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des articles...</p>
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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Articles <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MathArt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez nos articles sur les sciences, la technologie, l&apos;histoire et l&apos;art
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{articles.length}</p>
                  <p className="text-sm text-gray-600">Articles publiés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-sm text-gray-600">Catégories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{authors.length}</p>
                  <p className="text-sm text-gray-600">Auteurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="mb-8">
          <SearchFilters
            onFiltersChange={handleFiltersChange}
            categories={categories}
            authors={authors}
          />
        </div>

        {/* Résultats */}
        <div className="mb-6">
          <Badge className="bg-blue-100 text-blue-800 mb-4">
            {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Grille d'articles */}
        {filteredArticles.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche</p>
                <Badge className="bg-blue-100 text-blue-800">
                  Recherche d'articles
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article, index) => (
              <div 
                key={article.id} 
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl cursor-pointer p-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    style={{ objectPosition: 'center', display: 'block' }}
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
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </CardTitle>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={article.author.image || ""} alt={article.author.name} />
                      <AvatarFallback className="text-xs">
                        {article.author.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-gray-500">
                      {article.author.name} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/articles/${article.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group-hover:shadow-lg transition-all duration-300 mt-2">
                      <Eye className="mr-2 h-4 w-4" />
                      Lire l'article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Découvrez nos articles
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Explorez notre collection d'articles passionnants pour enrichir vos connaissances.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-6 py-2 text-base">
                  <FileText className="mr-2 h-4 w-4" />
                  Articles récents
                </Badge>
                {session?.user?.isAdmin && (
                  <Link href="/admin/articles">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      Gérer les articles
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
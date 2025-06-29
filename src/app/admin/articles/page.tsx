"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { SearchFilters, FilterState } from "@/components/ui/search-filters";

interface Article {
  id: number;
  title: string;
  excerpt: string | null;
  category: {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
  };
  published: boolean;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  // Chargement initial des articles
  useEffect(() => {
    const loadInitialArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles");
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
          
          // Extraire les catégories et auteurs uniques
          const uniqueCategories = [...new Set(data.map((article: Article) => article.category.name))];
          const uniqueAuthors = [...new Set(data.map((article: Article) => article.author.name))];
          
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
      let aValue: unknown, bValue: unknown;
      
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
          aValue = new Date(a.createdAt); // Utiliser createdAt car updatedAt n'est pas dans l'interface
          bValue = new Date(b.createdAt);
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
    published: 'all'
  });

  const filteredArticles = applyFilters(currentFilters);

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const handleDelete = async (articleId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    setDeletingId(articleId);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== articleId));
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de l'article");
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
          <h1 className="text-3xl font-bold">Gestion des articles</h1>
          <p className="text-gray-600">Créez et gérez les articles de votre site</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </Link>
      </div>

      {/* Recherche et filtres */}
      <div className="mb-6">
        <SearchFilters
          onFiltersChange={handleFiltersChange}
          categories={categories}
          authors={authors}
        />
      </div>

      {/* Résultats */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full text-white`}
                          style={{ backgroundColor: article.category.color || '#6B7280' }}>
                      {article.category.name}
                    </span>
                    {article.published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Publié
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Brouillon
                      </span>
                    )}
                  </div>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Par {article.author.name}</span>
                    <span>Le {new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/articles/${article.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/articles/${article.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
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

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun article trouvé</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  authors: string[];
}

export interface FilterState {
  search: string;
  category: string;
  author: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  published: string;
}

const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  author: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  published: 'true'
};

export function SearchFilters({ onFiltersChange, categories, authors }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Debounce pour la recherche
    if (key === 'search') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 300);
    } else {
      // Pas de debounce pour les autres filtres
      onFiltersChange(newFilters);
    }
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const toggleSortOrder = useCallback(() => {
    const newSortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    const newFilters = { ...filters, sortOrder: newSortOrder };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.author !== 'all' || filters.published !== 'true';

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, contenu ou auteur..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={toggleSortOrder}
          className="flex items-center gap-2"
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          {filters.sortBy === 'createdAt' ? 'Date' : 
           filters.sortBy === 'title' ? 'Titre' : 
           filters.sortBy === 'category' ? 'Catégorie' : 'Date'}
        </Button>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filtres avancés</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre par catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par auteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auteur
              </label>
              <Select
                value={filters.author}
                onValueChange={(value) => handleFilterChange('author', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les auteurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les auteurs</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select
                value={filters.published}
                onValueChange={(value) => handleFilterChange('published', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Publiés</SelectItem>
                  <SelectItem value="false">Brouillons</SelectItem>
                  <SelectItem value="all">Tous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options de tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trier par
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date de création</SelectItem>
                <SelectItem value="updatedAt">Date de modification</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Indicateurs de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Recherche: {filters.search}
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Catégorie: {filters.category}
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.author !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Auteur: {filters.author}
              <button
                onClick={() => handleFilterChange('author', 'all')}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.published === 'false' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Brouillons uniquement
              <button
                onClick={() => handleFilterChange('published', 'true')}
                className="ml-1 hover:text-yellow-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 
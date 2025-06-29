"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HybridEditor } from '@/components/ui/hybrid-editor';
import { FeaturedImageUpload } from '@/components/ui/featured-image-upload';
import { useSession } from 'next-auth/react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export default function NewArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Charger les catégories
    fetchCategories();
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
        }),
      });

      if (response.ok) {
        await response.json();
        router.push(`/admin/articles`);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l&apos;article');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Nouvel Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre */}
            <Card>
              <CardHeader>
                <CardTitle>Titre de l'article</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Entrez le titre de l'article..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            {/* Contenu */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu</CardTitle>
                <p className="text-sm text-gray-600">
                  Utilisez la barre d&apos;outils pour formater votre texte et insérer des formules LaTeX
                </p>
              </CardHeader>
              <CardContent>
                <HybridEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Commencez à écrire votre article... Vous pouvez utiliser Markdown et LaTeX."
                />
              </CardContent>
            </Card>

            {/* Extrait */}
            <Card>
              <CardHeader>
                <CardTitle>Extrait (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Un bref résumé de l'article..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Image principale */}
            <Card>
              <CardHeader>
                <CardTitle>Image principale</CardTitle>
              </CardHeader>
              <CardContent>
                <FeaturedImageUpload
                  onImageChange={(imageUrl) => handleInputChange('featuredImage', imageUrl || '')}
                  currentImage={formData.featuredImage || null}
                />
              </CardContent>
            </Card>

            {/* Catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="mathématiques, art, géométrie..."
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Séparez les tags par des virgules
                </p>
              </CardContent>
            </Card>

            {/* Publication */}
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <Label htmlFor="published">Publier immédiatement</Label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Si désactivé, l&apos;article sera sauvegardé comme brouillon
                </p>
              </CardContent>
            </Card>

            {/* Bouton de sauvegarde */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer l&apos;article
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 
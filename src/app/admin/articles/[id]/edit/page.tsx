"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HybridEditor } from "@/components/ui/hybrid-editor";
import { FeaturedImageUpload } from "@/components/ui/featured-image-upload";
import { useSession } from "next-auth/react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Session } from "next-auth";

interface Category {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
}

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string;
  categoryId: number;
  tags: string | null;
  published: boolean;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  category: {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EditArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    categoryId: "",
    tags: "",
    published: false,
  });

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || "",
          featuredImage: data.featuredImage || "",
          categoryId: data.categoryId.toString(),
          tags: data.tags || "",
          published: data.published,
        });
      } else {
        alert("Article non trouvé");
        router.push("/admin/articles");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'article:", error);
      alert("Erreur lors du chargement de l'article");
    }
  }, [params.id, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories?activeOnly=true");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as Session["user"])?.isAdmin) {
      fetchArticle();
      fetchCategories();
    }
  }, [session, status, fetchArticle, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
        }),
      });

      if (response.ok) {
        alert("Article mis à jour avec succès");
        router.push("/admin/articles");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour de l'article");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
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
        <h1 className="text-3xl font-bold">Modifier l&apos;article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre */}
            <Card>
              <CardHeader>
                <CardTitle>Titre de l&apos;article</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Entrez le titre de l&apos;article..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                  onChange={(content) => handleInputChange("content", content)}
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
                  placeholder="Un bref résumé de l&apos;article..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
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
                  onImageChange={(imageUrl) => handleInputChange("featuredImage", imageUrl || "")}
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
                  onValueChange={(value) => handleInputChange("categoryId", value)}
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
                  onChange={(e) => handleInputChange("tags", e.target.value)}
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
                    onCheckedChange={(checked) => handleInputChange("published", checked)}
                  />
                  <Label htmlFor="published">Publier immédiatement</Label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Si désactivé, l&apos;article sera sauvegardé comme brouillon
                </p>
              </CardContent>
            </Card>

            {/* Informations sur l'article */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Auteur:</span> {article.author.name}
                </div>
                <div>
                  <span className="font-medium">Créé le:</span> {new Date(article.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Modifié le:</span> {new Date(article.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Bouton de sauvegarde */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 
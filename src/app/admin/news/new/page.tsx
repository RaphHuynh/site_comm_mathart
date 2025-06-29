"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { HybridRenderer } from "@/components/ui/hybrid-renderer";

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Le titre et le contenu sont requis");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const news = await response.json();
        router.push(`/news/${news.id}`);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de l&apos;actualité");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/news" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux actualités
        </Link>
        <h1 className="text-3xl font-bold">Nouvelle Actualité</h1>
        <p className="text-gray-600">Créez une nouvelle actualité pour informer la communauté</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l&apos;actualité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Titre de l&apos;actualité"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Extrait</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Court résumé de l&apos;actualité (optionnel)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Contenu de l&apos;actualité..."
                    rows={15}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Vous pouvez utiliser Markdown et LaTeX dans le contenu.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Link href="/admin/news">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer l&apos;actualité
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Aperçu */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.title || formData.content ? (
                  <div className="space-y-4">
                    {formData.title && (
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Titre</h2>
                        <p className="text-gray-700">{formData.title}</p>
                      </div>
                    )}
                    
                    {formData.excerpt && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Extrait</h3>
                        <p className="text-gray-600 italic">{formData.excerpt}</p>
                      </div>
                    )}
                    
                    {formData.content && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Contenu</h3>
                        <div className="prose prose-sm max-w-none">
                          <HybridRenderer content={formData.content} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aperçu de l&apos;actualité</p>
                    <p className="text-sm mt-2">Commencez à écrire pour voir l&apos;aperçu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Comments } from '@/components/ui/comments';
import { HybridRenderer } from '@/components/ui/hybrid-renderer';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  tags: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ArticlePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else {
        alert('Article non trouvé');
        router.push('/articles');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error);
      alert('Erreur lors du chargement de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Article supprimé avec succès');
        router.push('/admin/articles');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'article');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = session?.user && (
    article?.author.id === session.user.id || 
    session.user.isAdmin
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Article non trouvé</p>
      </div>
    );
  }

  const tags = article.tags ? article.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        )}
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: article.category.color || '#6b7280',
                color: 'white'
              }}
            >
              {article.category.icon && <span className="mr-1">{article.category.icon}</span>}
              {article.category.name}
            </Badge>
            {!article.published && (
              <Badge variant="outline" className="flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Brouillon
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
          )}

          {/* Image principale */}
          {article.featuredImage && (
            <div className="mb-6">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <div className="flex gap-1">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Contenu */}
        <div className="prose prose-lg max-w-none mb-12">
          <HybridRenderer content={article.content} />
        </div>

        {/* Commentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Commentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <Comments articleId={article.id} />
          </CardContent>
        </Card>
      </article>

      <style jsx global>{`
        .rich-content {
          line-height: 1.7;
        }
        
        .rich-content h1,
        .rich-content h2,
        .rich-content h3,
        .rich-content h4,
        .rich-content h5,
        .rich-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .rich-content h1 { font-size: 2rem; }
        .rich-content h2 { font-size: 1.75rem; }
        .rich-content h3 { font-size: 1.5rem; }
        .rich-content h4 { font-size: 1.25rem; }
        .rich-content h5 { font-size: 1.125rem; }
        .rich-content h6 { font-size: 1rem; }
        
        .rich-content p {
          margin-bottom: 1rem;
        }
        
        .rich-content ul,
        .rich-content ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
        
        .rich-content li {
          margin-bottom: 0.5rem;
        }
        
        .rich-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .rich-content pre {
          background-color: #23272f;
          color: #fff;
          padding: 1.5rem 2rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 1.15rem;
          font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
          border: none;
          box-shadow: 0 2px 8px 0 rgba(30,34,40,0.07);
          line-height: 1.7;
        }
        
        .rich-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
          font-size: inherit;
          font-family: inherit;
        }
        
        .rich-content code {
          background-color: #23272f;
          color: #fff;
          padding: 0.18em 0.4em;
          border-radius: 0.3em;
          font-size: 1em;
          font-family: inherit;
        }
        
        .rich-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-content a:hover {
          color: #1d4ed8;
        }
        
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        
        .rich-content strong {
          font-weight: 600;
        }
        
        .rich-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 
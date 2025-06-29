"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Trash2, 
  Check, 
  X,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { HybridRenderer } from "@/components/ui/hybrid-renderer";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  isApproved: boolean;
  author: {
    id: string;
    name: string;
    image: string | null;
    isAdmin: boolean;
  };
  article: {
    id: number;
    title: string;
  };
  replies: Comment[];
  likes: { userId: string }[];
  _count: {
    likes: number;
    replies: number;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showApproved, setShowApproved] = useState(true);
  const [showPending, setShowPending] = useState(true);

  // Charger les commentaires
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/comments");
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  // Approuver/désapprouver un commentaire
  const handleToggleApproval = async (commentId: number, currentStatus: boolean) => {
    setUpdatingId(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (response.ok) {
        await loadComments();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification du statut");
    } finally {
      setUpdatingId(null);
    }
  };

  // Supprimer un commentaire
  const handleDelete = async (commentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

    setUpdatingId(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadComments();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrer les commentaires
  const filteredComments = comments.filter(comment => {
    if (showApproved && showPending) return true;
    if (showApproved && comment.isApproved) return true;
    if (showPending && !comment.isApproved) return true;
    return false;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commentaires</h1>
          <p className="text-gray-600">Modérez les commentaires de votre site</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={showApproved ? "default" : "outline"}
              size="sm"
              onClick={() => setShowApproved(!showApproved)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approuvés ({comments.filter(c => c.isApproved).length})
            </Button>
            <Button
              variant={showPending ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPending(!showPending)}
            >
              <X className="h-4 w-4 mr-1" />
              En attente ({comments.filter(c => !c.isApproved).length})
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{comments.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{comments.filter(c => c.isApproved).length}</p>
                <p className="text-sm text-gray-600">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{comments.filter(c => !c.isApproved).length}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {comments.reduce((sum, c) => sum + c._count.likes, 0)}
                </p>
                <p className="text-sm text-gray-600">Likes totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun commentaire</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun commentaire ne correspond aux filtres sélectionnés.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
                    <AvatarFallback>
                      {comment.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{comment.author.name}</span>
                      {comment.author.isAdmin && (
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      <Badge 
                        variant={comment.isApproved ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {comment.isApproved ? "Approuvé" : "En attente"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">
                        Article: <a href={`/articles/${comment.article.id}`} className="text-blue-600 hover:underline">
                          {comment.article.title}
                        </a>
                      </p>
                    </div>

                    <div className="prose prose-sm max-w-none mb-3">
                      <HybridRenderer content={comment.content} />
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{comment._count.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Reply className="h-4 w-4" />
                        <span>{comment._count.replies}</span>
                      </div>
                    </div>

                    {/* Réponses */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 border-l-2 border-gray-200 pl-4">
                        <p className="text-sm font-medium mb-2">Réponses ({comment.replies.length})</p>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{reply.author.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <HybridRenderer content={reply.content} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleApproval(comment.id, comment.isApproved)}
                      disabled={updatingId === comment.id}
                    >
                      {updatingId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : comment.isApproved ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={updatingId === comment.id}
                    >
                      {updatingId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
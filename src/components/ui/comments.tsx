"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Edit, 
  Trash2, 
  Send,
  Loader2
} from "lucide-react";
import { HybridRenderer } from "./hybrid-renderer";

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
  replies: Comment[];
  likes: { userId: string }[];
  _count: {
    likes: number;
    replies: number;
  };
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onLike: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onReply: (commentId: number) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onSubmitReply: (parentId: number) => void;
  replyingTo: number | null;
  editingComment: number | null;
  replyContent: string;
  editContent: string;
  setReplyContent: (content: string) => void;
  setEditContent: (content: string) => void;
  submitting: boolean;
  session: unknown;
}

const CommentItem = memo(({
  comment,
  isReply = false,
  onLike,
  onEdit,
  onDelete,
  onReply,
  onCancelReply,
  onCancelEdit,
  onSubmitReply,
  replyingTo,
  editingComment,
  replyContent,
  editContent,
  setReplyContent,
  setEditContent,
  submitting,
  session
}: CommentItemProps) => {
  const isAuthor = session?.user?.id === comment.author.id;
  const isAdmin = session?.user?.isAdmin;
  const isLiked = comment.likes.some(like => like.userId === session?.user?.id);

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
              <AvatarFallback>
                {comment.author.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">{comment.author.name}</span>
                {comment.author.isAdmin && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Admin
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Modifier votre commentaire..."
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => onEdit(comment.id, editContent)}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={onCancelEdit}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <HybridRenderer content={comment.content} />
                </div>
              )}

              <div className="flex items-center space-x-4 mt-3">
                <button
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center space-x-1 text-sm ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{comment._count.likes}</span>
                </button>

                {!isReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Répondre</span>
                  </button>
                )}

                {(isAuthor || isAdmin) && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditContent(comment.content)}
                      className="text-sm text-gray-500 hover:text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-sm text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Formulaire de réponse */}
              {replyingTo === comment.id && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Écrire une réponse..."
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => onSubmitReply(comment.id)}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Répondre"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={onCancelReply}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {/* Réponses */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                  {comment.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      isReply={true}
                      onLike={onLike}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReply={onReply}
                      onCancelReply={onCancelReply}
                      onCancelEdit={onCancelEdit}
                      onSubmitReply={onSubmitReply}
                      replyingTo={replyingTo}
                      editingComment={editingComment}
                      replyContent={replyContent}
                      editContent={editContent}
                      setReplyContent={setReplyContent}
                      setEditContent={setEditContent}
                      submitting={submitting}
                      session={session}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

interface CommentsProps {
  articleId: number;
}

export function Comments({ articleId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Charger les commentaires
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Soumettre un nouveau commentaire
  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          articleId: articleId,
        }),
      });

      if (response.ok) {
        setNewComment("");
        await loadComments();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création du commentaire");
    } finally {
      setSubmitting(false);
    }
  }, [newComment, articleId, loadComments]);

  // Soumettre une réponse
  const handleSubmitReply = useCallback(async (parentId: number) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          articleId: articleId,
          parentId: parentId,
        }),
      });

      if (response.ok) {
        setReplyContent("");
        setReplyingTo(null);
        await loadComments();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de la réponse");
    } finally {
      setSubmitting(false);
    }
  }, [replyContent, articleId, loadComments]);

  // Liker/unliker un commentaire
  const handleLike = useCallback(async (commentId: number) => {
    if (!session?.user) {
      alert("Vous devez être connecté pour liker un commentaire");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        await loadComments();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [session?.user, loadComments]);

  // Modifier un commentaire
  const handleEdit = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setEditingComment(null);
        setEditContent("");
        await loadComments();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification du commentaire");
    }
  }, [loadComments]);

  // Supprimer un commentaire
  const handleDelete = useCallback(async (commentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

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
      alert("Erreur lors de la suppression du commentaire");
    }
  }, [loadComments]);

  // Gérer les réponses
  const handleReply = useCallback((commentId: number) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  }, [replyingTo]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent("");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
    setEditContent("");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Formulaire de nouveau commentaire */}
      {session?.user ? (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez vos pensées..."
                rows={3}
                required
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Commenter</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="text-center text-gray-600">
              <a href="/login" className="text-blue-600 hover:underline">
                Connectez-vous
              </a>{" "}
              pour laisser un commentaire
            </p>
          </CardContent>
        </Card>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="pt-4">
              <p className="text-center text-gray-500">
                Aucun commentaire pour le moment. Soyez le premier à commenter !
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReply={handleReply}
              onCancelReply={handleCancelReply}
              onCancelEdit={handleCancelEdit}
              onSubmitReply={handleSubmitReply}
              replyingTo={replyingTo}
              editingComment={editingComment}
              replyContent={replyContent}
              editContent={editContent}
              setReplyContent={setReplyContent}
              setEditContent={setEditContent}
              submitting={submitting}
              session={session}
            />
          ))
        )}
      </div>
    </div>
  );
} 
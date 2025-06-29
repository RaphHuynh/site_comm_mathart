"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  Loader2
} from "lucide-react";

interface FeaturedImageUploadProps {
  onImageChange: (imageUrl: string | null) => void;
  currentImage?: string | null;
  maxSize?: number; // en MB
}

export function FeaturedImageUpload({ 
  onImageChange, 
  currentImage,
  maxSize = 5 
}: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Le fichier est trop volumineux. Taille maximum: ${maxSize}MB`);
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert(`Le fichier n&apos;est pas une image valide.`);
      return;
    }

    setUploading(true);

    try {
      // Upload vers l'API
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onImageChange(data.url);
      } else {
        const error = await response.json();
        alert(`Erreur lors de l'upload: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert("Erreur lors de l&apos;upload de l&apos;image");
    } finally {
      setUploading(false);
    }
  }, [maxSize, onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Image actuelle */}
      {currentImage && (
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <img
                src={currentImage}
                alt="Image principale"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Image principale de l'article
            </p>
          </CardContent>
        </Card>
      )}

      {/* Zone de drop */}
      {!currentImage && (
        <Card>
          <CardContent className="pt-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Déposez l'image ici...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez une image ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats acceptés: JPG, PNG, GIF, WebP (max {maxSize}MB)
                  </p>
                  <p className="text-sm text-gray-500">
                    Cette image sera utilisée comme illustration principale de l&apos;article
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicateur de chargement */}
      {uploading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Upload en cours...</span>
        </div>
      )}
    </div>
  );
} 
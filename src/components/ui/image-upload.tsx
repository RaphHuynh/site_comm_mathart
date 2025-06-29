"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  Loader2
} from "lucide-react";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number; // en MB
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploading: boolean;
}

export function ImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 5 
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Vous ne pouvez uploader que ${maxImages} images maximum.`);
      return;
    }

    setUploading(true);

    const newImages: UploadedImage[] = [];

    for (const file of acceptedFiles) {
      // Vérifier la taille
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux. Taille maximum: ${maxSize}MB`);
        continue;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n&apos;est pas une image valide.`);
        continue;
      }

      const imageId = Math.random().toString(36).substr(2, 9);
      
      // Créer une URL temporaire pour la prévisualisation
      const tempUrl = URL.createObjectURL(file);
      
      newImages.push({
        id: imageId,
        url: tempUrl,
        name: file.name,
        uploading: true
      });

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
          
          // Remplacer l'URL temporaire par l'URL finale
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, url: data.url, uploading: false }
              : img
          ));
        } else {
          const error = await response.json();
          alert(`Erreur lors de l&apos;upload de ${file.name}: ${error.error}`);
          
          // Supprimer l'image en erreur
          setImages(prev => prev.filter(img => img.id !== imageId));
        }
      } catch (error) {
        console.error('Erreur upload:', error);
        alert(`Erreur lors de l&apos;upload de ${file.name}`);
        
        // Supprimer l'image en erreur
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
    }

    setUploading(false);
  }, [images.length, maxImages, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      onImagesChange(newImages.map(img => img.url));
      return newImages;
    });
  };

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
    onImagesChange(newImages.map(img => img.url));
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
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
              ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Déposez les images ici...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Glissez-déposez des images ici, ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-500">
                  Formats acceptés: JPG, PNG, GIF, WebP (max {maxSize}MB par image)
                </p>
                <p className="text-sm text-gray-500">
                  {images.length}/{maxImages} images
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images uploadées */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay de chargement */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  
                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={image.uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm font-medium truncate">{image.name}</p>
                  {image.uploading && (
                    <p className="text-xs text-blue-600">Upload en cours...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Indicateur de chargement global */}
      {uploading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Upload en cours...</span>
        </div>
      )}
    </div>
  );
} 
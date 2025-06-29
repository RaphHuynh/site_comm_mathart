"use client";

import { useState, useRef } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Code,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface HybridEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function HybridEditor({ content, onChange, placeholder = "Commencez à écrire..." }: HybridEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let newCursorPos = start;
    
    switch (text) {
      case 'bold':
        newText = `**${selectedText || 'texte en gras'}**`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 8);
        break;
      case 'italic':
        newText = `*${selectedText || 'texte en italique'}*`;
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 15);
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 4);
        break;
      case 'h1':
        newText = `# ${selectedText || 'Titre 1'}`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 6);
        break;
      case 'h2':
        newText = `## ${selectedText || 'Titre 2'}`;
        newCursorPos = start + 3 + (selectedText ? selectedText.length : 6);
        break;
      case 'h3':
        newText = `### ${selectedText || 'Titre 3'}`;
        newCursorPos = start + 4 + (selectedText ? selectedText.length : 6);
        break;
      case 'ul':
        newText = `- ${selectedText || 'élément de liste'}`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 16);
        break;
      case 'ol':
        newText = `1. ${selectedText || 'élément de liste'}`;
        newCursorPos = start + 3 + (selectedText ? selectedText.length : 16);
        break;
      case 'quote':
        newText = `> ${selectedText || 'citation'}`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 8);
        break;
      case 'latex':
        newText = `$${selectedText || 'E=mc^2'}$`;
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 6);
        break;
      case 'latex-block':
        newText = `$$\n${selectedText || '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n'}$`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 30);
        break;
      case 'link':
        newText = `[${selectedText || 'texte du lien'}](url)`;
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 12);
        break;
      case 'image':
        newText = `![${selectedText || 'description de l&apos;image'}](url)`;
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 25);
        break;
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    onChange(newContent);
    
    // Focus et positionner le curseur
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse. Taille maximum: 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Insérer l'image à la position du curseur
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const selectedText = content.substring(start, textarea.selectionEnd);
          
          // Créer le texte Markdown pour l'image
          const imageText = `![${file.name.replace(/\.[^/.]+$/, '')}](${data.url})`;
          
          // Insérer l'image dans le contenu
          const newContent = content.substring(0, start) + imageText + content.substring(textarea.selectionEnd);
          onChange(newContent);
          
          // Positionner le curseur après l'image
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(start + imageText.length, start + imageText.length);
            }
          }, 0);
        }
      } else {
        const error = await response.json();
        alert(`Erreur lors de l'upload: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Formatage de texte */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('bold')}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('italic')}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('code')}
          title="Code inline"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Titres */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('h1')}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('h2')}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('h3')}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Listes et citations */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('ul')}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('ol')}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('quote')}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* LaTeX */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('latex')}
          title="Formule LaTeX inline"
        >
          <span className="text-sm font-mono">$</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('latex-block')}
          title="Bloc LaTeX"
        >
          <span className="text-sm font-mono">$$</span>
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Liens et images */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('link')}
          title="Lien"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        {/* Upload d'image */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload d'image"
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        {/* URL d'image */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('image')}
          title="Image par URL"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Aide */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          title="Aide"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MenuBar />
      
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] border-0 focus:ring-0 resize-none"
      />
      
      {/* Input file caché pour l'upload d'images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Indicateur de chargement */}
      {uploading && (
        <div className="flex items-center justify-center p-2 bg-blue-50 border-t">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-600">Upload en cours...</span>
        </div>
      )}
      
      {/* Aide */}
      {showHelp && (
        <Card className="border-t-0 rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Guide d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Formatage</h4>
                <ul className="space-y-1">
                  <li><code>**texte**</code> = gras</li>
                  <li><code>*texte*</code> = italique</li>
                  <li><code>`code`</code> = code inline</li>
                  <li><code># Titre</code> = titre 1</li>
                  <li><code>## Titre</code> = titre 2</li>
                  <li><code>### Titre</code> = titre 3</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">LaTeX</h4>
                <ul className="space-y-1">
                  <li><code>$E=mc^2$</code> = formule inline</li>
                  <li><code>$$\frac{a}{b}$$</code> = bloc de formule</li>
                  <li><code>$$\int_0^\infty e^{-x} dx$$</code> = intégrale</li>
                  <li><code>$$\sum_{i=1}^n x_i$$</code> = somme</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
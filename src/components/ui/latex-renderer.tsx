"use client";

import { useEffect, useRef, useState } from 'react';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = "" }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isClient) return;

    const container = containerRef.current;
    
    // Fonction pour remplacer les blocs LaTeX inline et display
    const renderLatex = async () => {
      try {
        // Import dynamique de KaTeX
        const katex = (await import('katex')).default;
        
        // Remplacer les formules inline \( ... \)
        let processedContent = content.replace(/\\\((.*?)\\\)/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
              output: 'html'
            });
          } catch (error) {
            console.error('Erreur LaTeX inline:', error);
            return match; // Garder l'original en cas d'erreur
          }
        });

        // Remplacer les formules display \[ ... \]
        processedContent = processedContent.replace(/\\\[(.*?)\\\]/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: true,
              output: 'html'
            });
          } catch (error) {
            console.error('Erreur LaTeX display:', error);
            return match; // Garder l'original en cas d'erreur
          }
        });

        // Remplacer les formules $$ ... $$
        processedContent = processedContent.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: true,
              output: 'html'
            });
          } catch (error) {
            console.error('Erreur LaTeX $$:', error);
            return match; // Garder l'original en cas d'erreur
          }
        });

        // Remplacer les formules $ ... $
        processedContent = processedContent.replace(/\$([^$]+)\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
              output: 'html'
            });
          } catch (error) {
            console.error('Erreur LaTeX $:', error);
            return match; // Garder l'original en cas d'erreur
          }
        });

        container.innerHTML = processedContent;
      } catch (error) {
        console.error('Erreur lors du chargement de KaTeX:', error);
        // En cas d'erreur, afficher le contenu brut
        container.innerHTML = content;
      }
    };

    renderLatex();
  }, [content, isClient]);

  return (
    <div 
      ref={containerRef} 
      className={`latex-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 
"use client";

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';

interface HybridRendererProps {
  content: string;
  className?: string;
}

export function HybridRenderer({ content, className = "" }: HybridRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isClient) return;

    const container = containerRef.current;
    
    // Fonction pour traiter le contenu Markdown + LaTeX
    const processContent = async () => {
      try {
        // Import dynamique de KaTeX
        const katex = (await import('katex')).default;
        
        // Fonction pour traiter les formules LaTeX dans le contenu Markdown
        const processLatexInMarkdown = (markdownContent: string) => {
          // Remplacer les formules inline \( ... \)
          let processed = markdownContent.replace(/\\\((.*?)\\\)/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: false,
                output: 'html'
              });
            } catch (error) {
              console.error('Erreur LaTeX inline:', error);
              return match;
            }
          });

          // Remplacer les formules display \[ ... \]
          processed = processed.replace(/\\\[(.*?)\\\]/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: true,
                output: 'html'
              });
            } catch (error) {
              console.error('Erreur LaTeX display:', error);
              return match;
            }
          });

          // Remplacer les formules $$ ... $$
          processed = processed.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: true,
                output: 'html'
              });
            } catch (error) {
              console.error('Erreur LaTeX $$:', error);
              return match;
            }
          });

          // Remplacer les formules $ ... $ (mais pas dans les blocs de code)
          processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: false,
                output: 'html'
              });
            } catch (error) {
              console.error('Erreur LaTeX $:', error);
              return match;
            }
          });

          return processed;
        };

        // Traiter le contenu avec LaTeX
        const processedContent = processLatexInMarkdown(content);
        
        // Rendre le contenu Markdown avec LaTeX intégré
        const markdownElement = (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              // Personnalisation des titres
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-bold text-gray-900 mb-2 mt-4">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-base font-bold text-gray-900 mb-2 mt-4">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-sm font-bold text-gray-900 mb-2 mt-4">
                  {children}
                </h6>
              ),
              // Personnalisation des paragraphes
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-gray-800">
                  {children}
                </p>
              ),
              // Personnalisation des listes
              ul: ({ children }) => (
                <ul className="mb-4 ml-6 list-disc space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 ml-6 list-decimal space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-800">
                  {children}
                </li>
              ),
              // Personnalisation des blocs de code
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code {...props}>
                    {children}
                  </code>
                );
              },
              // Personnalisation des liens
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              // Personnalisation des images
              img: ({ src, alt, ...props }) => (
                <div className="my-6 text-center">
                  <img
                    src={src}
                    alt={alt || 'Image'}
                    className="max-w-full h-auto rounded-lg shadow-lg mx-auto cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      if (src) {
                        window.open(src, '_blank');
                      }
                    }}
                    {...props}
                  />
                  {alt && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {alt}
                    </p>
                  )}
                </div>
              ),
              // Personnalisation des citations
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">
                  {children}
                </blockquote>
              ),
              // Personnalisation des tableaux
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-300">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 px-4 py-2">
                  {children}
                </td>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        );

        // Rendre le composant React dans le conteneur
        const { createRoot } = await import('react-dom/client');
        const root = createRoot(container);
        root.render(markdownElement);

      } catch (error) {
        console.error('Erreur lors du traitement:', error);
        container.innerHTML = content;
      }
    };

    processContent();
  }, [content, isClient]);

  return (
    <div 
      ref={containerRef} 
      className={`rich-content ${className}`}
    />
  );
} 
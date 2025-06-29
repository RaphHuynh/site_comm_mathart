"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation } from "@/components/layout/Navigation";
import { MessageCircle, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl);
      }
    });

    // Afficher les erreurs d'authentification
    if (errorParam) {
      switch (errorParam) {
        case "Callback":
          setError("Erreur lors de la connexion. Veuillez réessayer.");
          break;
        case "AccessDenied":
          setError("Accès refusé. Veuillez autoriser l'accès à votre compte Discord.");
          break;
        default:
          setError("Une erreur s'est produite lors de la connexion.");
      }
    }
  }, [router, callbackUrl, errorParam]);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn("discord", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Erreur lors de la connexion. Veuillez réessayer.");
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">MA</span>
            </div>
            <CardTitle className="text-2xl">Connexion à MathArt</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte Discord pour accéder à la communauté
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {isLoading ? "Connexion en cours..." : "Se connecter avec Discord"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>
                En vous connectant, vous acceptez nos{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              © 2024 MathArt. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
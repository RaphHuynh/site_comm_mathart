"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Plus, Shield, FileText } from "lucide-react";
import { Session } from "next-auth";

interface NavigationProps {
  showCreateButton?: boolean;
  createButtonHref?: string;
  createButtonText?: string;
}

export function Navigation({ showCreateButton = false, createButtonHref = "", createButtonText = "" }: NavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MathArt</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors ${isActive("/") ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}`}
            >
              Accueil
            </Link>
            <Link 
              href="/articles" 
              className={`transition-colors ${isActive("/articles") ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}`}
            >
              Articles
            </Link>
            <Link 
              href="/news" 
              className={`transition-colors ${isActive("/news") ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}`}
            >
              Actualités
            </Link>
            <Link 
              href="/events" 
              className={`transition-colors ${isActive("/events") ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}`}
            >
              Événements
            </Link>
            <Link 
              href="/community" 
              className={`transition-colors ${isActive("/community") ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}`}
            >
              Communauté
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {showCreateButton && session.user && (session.user as Session["user"]).isAdmin && (
                  <Link href={createButtonHref}>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      {createButtonText}
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                        {session.user && (session.user as Session["user"]).isAdmin && (
                          <p className="text-xs leading-none text-blue-600 font-medium">
                            Administrateur
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {session.user && (session.user as Session["user"]).isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
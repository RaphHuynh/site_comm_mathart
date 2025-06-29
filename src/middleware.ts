import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.isAdmin;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // Si l'utilisateur essaie d'accéder à une route admin mais n'est pas admin
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
}; 
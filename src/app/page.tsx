"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for Auth0 to finish loading
    if (isLoading) return;

    // Mark that we've checked at least once
    setHasChecked(true);

    // Clear any cached data if user is not authenticated
    if (!isAuthenticated) {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Redirect based on authentication status
    if (isAuthenticated && user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking authentication
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center postingo-gradient">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center postingo-gradient">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <p>リダイレクト中...</p>
      </div>
    </div>
  );
}

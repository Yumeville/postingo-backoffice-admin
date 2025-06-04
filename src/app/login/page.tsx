"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Image from "next/image";

export default function LoginPage() {
  const { user, loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      // If Auth0 is still loading, don't do anything yet
      if (isLoading) return;

      // If not authenticated, stop checking and show login
      if (!isAuthenticated || !user?.email) {
        setChecking(false);
        return;
      }

      try {
        const res = await api.get(`/users/${user.email}`);
        const { approved } = res.data;

        if (!approved) {
          router.push("/awaiting-approval");
        } else {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          // Register new user
          await api.post("/users/register", {
            auth0Id: user.sub,
            email: user.email,
          });
          router.push("/awaiting-approval");
        } else {
          console.error("Login validation failed:", err);
        }
      } finally {
        setChecking(false);
      }
    };

    verifyUser();
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading while Auth0 is loading or while we're checking user status
  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center postingo-gradient">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center postingo-gradient">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/images/postingo-icon.png"
                alt="PostinGo"
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">PostinGo</h1>
            <h2 className="text-xl font-semibold postingo-primary-text mb-2">管理画面</h2>
            <p className="text-gray-600">管理者ログイン</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => loginWithRedirect()}
              className="w-full postingo-primary hover:bg-opacity-90 text-white py-3 text-lg font-medium"
            >
              ログイン
            </Button>
            
            <div className="text-center">
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // we're redirecting elsewhere
}

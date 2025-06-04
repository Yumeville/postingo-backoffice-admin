"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth0();
  const [userApproved, setUserApproved] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserApproval = async () => {
      // If Auth0 is still loading, wait
      if (isLoading) {
        setIsChecking(true);
        return;
      }

      // If not authenticated, redirect to home (which goes to login)
      if (!isAuthenticated || !user?.email) {
        router.push("/");
        return;
      }

      try {
        const res = await api.get(`/users/${user.email}`);
        const { approved } = res.data;
        
        if (!approved) {
          router.push("/awaiting-approval");
        } else {
          setUserApproved(true);
        }
      } catch (err) {
        console.error("Failed to check user approval:", err);
        // If user doesn't exist or other error, redirect to login
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkUserApproval();
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading || isChecking || userApproved === null) {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
} 
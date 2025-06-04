"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRedirectUri(window.location.origin);
  }, []);

  // Prevent hydration mismatch by not rendering Auth0Provider on server
  if (!isClient || !redirectUri) {
    return (
      <div className="min-h-screen flex items-center justify-center postingo-gradient">
        <div className="text-center text-white">
          <div className="animate-pulse">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain="dev-0jrv348lgrj1zthn.jp.auth0.com"
      clientId="soRmCCWdsw1wczszaG0buFeszWn0l19k"
      authorizationParams={{ 
        redirect_uri: redirectUri,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}

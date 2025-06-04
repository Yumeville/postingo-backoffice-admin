"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AwaitingApprovalPage() {
  const { logout } = useAuth0();
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-xl font-semibold">アカウント承認待ち</h1>
      <p className="text-gray-600 text-center">
        管理者によるアカウント承認が完了するまでお待ちください。
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.refresh()}>
          ステータスを更新
        </Button>
        <Button variant="destructive" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          ログアウト
        </Button>
      </div>
    </div>
  );
}

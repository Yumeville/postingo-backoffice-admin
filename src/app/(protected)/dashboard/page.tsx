"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Search, Trash2, Check, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  approved: boolean;
}

interface ToastState {
  show: boolean;
  title: string;
  description: string;
  variant: "default" | "destructive" | "success";
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState<string | null>(null); // Track which user is being approved
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // Track which user is being deleted
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "not-approved">("all");
  const [toast, setToast] = useState<ToastState>({ show: false, title: "", description: "", variant: "default" });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    type: "approve" | "delete";
    userId: string;
    userEmail: string;
  }>({ show: false, type: "approve", userId: "", userEmail: "" });

  const showToast = useCallback((title: string, description: string, variant: "default" | "destructive" | "success" = "default") => {
    setToast({ show: true, title, description, variant });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching users from:", api.defaults.baseURL + "/users");
      const res = await api.get("/users");
      console.log("Users fetched successfully:", res.data);
      setUsers(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch users:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      showToast("エラー", "ユーザーの取得に失敗しました", "destructive");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply approval status filter
    if (approvalFilter === "approved") {
      filtered = filtered.filter(user => user.approved);
    } else if (approvalFilter === "not-approved") {
      filtered = filtered.filter(user => !user.approved);
    }
    // If "all" is selected, no additional filtering is needed

    setFilteredUsers(filtered);
  }, [users, searchQuery, approvalFilter]);

  useEffect(() => {
    fetchUsers();
  }, []); // Remove fetchUsers from dependency array to prevent infinite loop

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleApprove = (userId: string, userEmail: string) => {
    setConfirmDialog({
      show: true,
      type: "approve",
      userId,
      userEmail
    });
  };

  const handleDelete = (userId: string, userEmail: string) => {
    setConfirmDialog({
      show: true,
      type: "delete",
      userId,
      userEmail
    });
  };

  const confirmApprove = async () => {
    setApproveLoading(confirmDialog.userId);
    try {
      await api.put(`/users/${confirmDialog.userId}/approve`);
      await fetchUsers();
      showToast("成功", "ユーザーが承認されました", "success");
    } catch (err) {
      console.error("Failed to approve user:", err);
      showToast("エラー", "ユーザーの承認に失敗しました", "destructive");
    } finally {
      setApproveLoading(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(confirmDialog.userId);
    try {
      await api.delete(`/users/${confirmDialog.userEmail}`);
      await fetchUsers();
      showToast("成功", "ユーザーが削除されました", "success");
    } catch (err) {
      console.error("Failed to delete user:", err);
      showToast("エラー", "ユーザーの削除に失敗しました", "destructive");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getFilterDescription = () => {
    switch (approvalFilter) {
      case "approved":
        return " (承認済みのみ)";
      case "not-approved":
        return " (未承認のみ)";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">エラー: {error}</p>
        <p className="text-sm text-gray-600 mt-2">
          API URL: {api.defaults.baseURL}/users
        </p>
        <Button onClick={fetchUsers} className="mt-4" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              読み込み中...
            </>
          ) : (
            "再試行"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="メールアドレスまたは氏名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium whitespace-nowrap">
              ステータス:
            </label>
            <Select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as "all" | "approved" | "not-approved")}
              className="w-40"
            >
              <option value="all">すべて</option>
              <option value="approved">承認済み</option>
              <option value="not-approved">未承認</option>
            </Select>
          </div>
        </div>

        {/* User Count */}
        <div className="text-sm text-gray-600">
          {filteredUsers.length} 件のユーザーが見つかりました
          {searchQuery && ` (「${searchQuery}」で検索)`}
          {getFilterDescription()}
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery || approvalFilter !== "all" ? "条件に一致するユーザーが見つかりません" : "ユーザーが見つかりません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isApproving = approveLoading === user.id;
            const isDeleting = deleteLoading === user.id;
            const isActionInProgress = isApproving || isDeleting;

            return (
              <div
                key={user.id}
                className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-shadow ${
                  isActionInProgress ? "opacity-70" : ""
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium">{user.name || "未登録"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-1">
                    {user.approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" />
                        承認済み
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        承認待ち
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!user.approved && (
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(user.id, user.email)}
                      className="postingo-primary hover:bg-opacity-90 text-white"
                      disabled={isActionInProgress}
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          承認中...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          承認
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={isActionInProgress}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-4 w-4" />
                        削除
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        onClose={() => setConfirmDialog({ ...confirmDialog, show: false })}
        onConfirm={confirmDialog.type === "approve" ? confirmApprove : confirmDelete}
        title={confirmDialog.type === "approve" ? "ユーザー承認の確認" : "ユーザー削除の確認"}
        description={
          confirmDialog.type === "approve" 
            ? `${confirmDialog.userEmail} を承認しますか？` 
            : `${confirmDialog.userEmail} を削除しますか？この操作は取り消せません。`
        }
        confirmText={confirmDialog.type === "approve" ? "承認" : "削除"}
        variant={confirmDialog.type === "delete" ? "destructive" : "default"}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

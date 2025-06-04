"use client"

import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { ClientOnly } from "@/components/client-only"
import { cn } from "@/lib/utils"
import { Users, Home, LogOut, Menu, X } from "lucide-react"
import Image from "next/image"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const { logout, user } = useAuth0()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    {
      name: "ホーム",
      href: "/dashboard",
      icon: Home,
      current: true
    },
    {
      name: "ユーザー管理",
      href: "/dashboard",
      icon: Users,
      current: false
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-25" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header with Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b postingo-gradient">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/postingo-icon.png"
              alt="PostinGo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-white">PostinGo</h1>
              <p className="text-xs text-white/80">管理画面</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-white/80"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.current
                    ? "postingo-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <ClientOnly fallback={
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-300 animate-pulse rounded" />
              </div>
            </div>
          }>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full postingo-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout({ 
                logoutParams: { 
                  returnTo: window.location.origin 
                } 
              })}
              className="w-full border-gray-300 hover:border-[#3C8D88] hover:text-[#3C8D88]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </ClientOnly>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b">
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Image
                src="/images/postingo-icon.png"
                alt="PostinGo"
                width={24}
                height={24}
              />
              <h1 className="text-lg font-semibold postingo-primary-text">PostinGo</h1>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  )
} 
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = "default", onClose, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 5000)

      return () => clearTimeout(timer)
    }, [onClose])

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-4 rounded-md border p-4 shadow-lg transition-all",
          {
            "border-border bg-background text-foreground": variant === "default",
            "border-red-500 bg-red-50 text-red-900": variant === "destructive",
            "border-green-500 bg-green-50 text-green-900": variant === "success",
          }
        )}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast, type ToastProps } 
"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-b-2 border-yellow-500",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-gray-600 mt-2 text-sm">{message}</p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  message?: string
  description?: string
}

export function LoadingPage({ 
  message = "Loading...", 
  description 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-gray-900 mt-4">{message}</h2>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  [key: string]: any
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className,
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800" />
          {typeof children === 'string' ? 'Loading...' : children}
        </div>
      ) : (
        children
      )}
    </button>
  )
} 
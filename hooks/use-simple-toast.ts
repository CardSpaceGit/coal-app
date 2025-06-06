export interface SimpleToast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = (newToast: SimpleToast) => {
    console.log(`Toast: ${newToast.title}`, newToast.description)
    
    // Simple alert-based implementation for immediate use
    if (newToast.variant === "destructive") {
      alert(`❌ ${newToast.title}${newToast.description ? '\n' + newToast.description : ''}`)
    } else {
      alert(`✅ ${newToast.title}${newToast.description ? '\n' + newToast.description : ''}`)
    }
  }

  return { toast }
} 
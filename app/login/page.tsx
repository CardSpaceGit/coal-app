"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Prevent scrolling on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Check if user is super admin first
        const { data: superAdminData } = await supabase
          .from("super_admins")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("is_active", true)
          .single()

        if (superAdminData) {
          router.push("/admin")
          return
        }

        // Check if user is linked to an organization
        const { data: orgUsers } = await supabase
          .from("organization_users")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("is_active", true)

        if (!orgUsers || orgUsers.length === 0) {
          setError("Your account is not linked to an organization. Please contact your administrator.")
          await supabase.auth.signOut()
          return
        }

        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/coal.gif"
          alt="Coal splash background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
        <Card className="mb-12 w-screen max-w-none rounded-b-none md:w-full md:max-w-lg md:rounded-[40px] bg-white border-0 rounded-t-[40px]">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl font-bold">
                  <span className="text-yellow-500">FT</span>
                  <span className="text-gray-800">COAL</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">supply & logistics</p>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to your
                <br />
                <span className="text-gray-900">Login</span>
              </h1>
              <p className="text-gray-600">
                Start managing your coal yard
                <br />
                operations efficiently.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="mt-2 h-12 rounded-full border-2 border-gray-200 px-4 focus:border-yellow-500 focus:ring-0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="h-12 rounded-full border-2 border-gray-200 px-4 pr-12 focus:border-yellow-500 focus:ring-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm text-center">{error}</div>}

              
              <Button
                type="submit"
                disabled={loading}
                className="mt-4 w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold rounded-full border-0"
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    LOG IN
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Eye, EyeOff, Lock, Menu } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { SlideOutMenu } from "@/components/ui/slide-out-menu"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSideMenu, setShowSideMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      loadProfileData()
    }
  }, [authLoading, user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user profile data
      const { data: profileData } = await supabase
        .from("organization_users")
        .select("*")
        .eq("user_id", user.user_id)
        .single()

      if (profileData && profileData.full_name) {
        setFullName(profileData.full_name as string)
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update full name if changed
      if (fullName !== user.full_name) {
        const { error: profileError } = await supabase
          .from("organization_users")
          .update({ full_name: fullName })
          .eq("user_id", user.user_id)

        if (profileError) {
          throw profileError
        }
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords do not match",
            variant: "destructive",
            duration: 3000,
          })
          return
        }

        if (newPassword.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
            duration: 3000,
          })
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (passwordError) {
          throw passwordError
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        duration: 3000,
      })

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Refresh user data
      window.location.reload()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Coal themed like dashboard */}
      <div className="bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/coal-texture.png" alt="Coal texture background" fill className="object-cover" priority />
        </div>
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowSideMenu(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-light">
              <span className="font-bold">Profile Settings</span>{" "}
              <span className="italic">manage your account.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">{user.organization?.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Role:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {user.role?.name || 'No Role Assigned'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Profile Header */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url || "/placeholder.svg"}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full mx-auto"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-semibold text-white">{user.full_name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                <Lock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user.full_name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Details</h3>
            <p className="text-sm text-gray-600 mb-6">Update your personal information and contact details.</p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 rounded-full border-2 border-gray-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-10 rounded-full border-2 border-gray-300 bg-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Note: To change your email address, please contact your admin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Password */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Password</h3>
            <p className="text-sm text-gray-600 mb-6">Add a new password to update your profile security.</p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="rounded-full border-2 border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="rounded-full border-2 border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="rounded-full border-2 border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSaveChanges}
          disabled={loading}
          className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold rounded-full"
        >
          {loading ? "Saving..." : "SAVE CHANGES"}
        </Button>
      </div>

      {/* Slide-out Menu */}
      <SlideOutMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onLogout={handleLogout}
        onProfile={() => {
          // Already on profile page, just close the menu
          setShowSideMenu(false)
        }}
        onDashboard={() => {
          setShowSideMenu(false)
          router.push("/dashboard")
        }}
        isLoggingOut={isLoggingOut}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, Shield, Plus, Menu, Warehouse, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Stats {
  totalUsers: number
  totalOrganizations: number
  totalRoles: number
  totalProducts: number
  totalCoalYards: number
  activeUsers: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalRoles: 0,
    totalProducts: 0,
    totalCoalYards: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get organization users count
      const { data: orgUsers } = await supabase
        .from('organization_users')
        .select('id, is_active')

      // Get organizations count
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id')

      // Get roles count
      const { data: roles } = await supabase
        .from('roles')
        .select('id')

      // Get products count
      const { data: products } = await supabase
        .from('products')
        .select('id')

      // Get coal yards count
      const { data: coalYards } = await supabase
        .from('coal_yards')
        .select('id')

      setStats({
        totalUsers: orgUsers?.length || 0,
        totalOrganizations: organizations?.length || 0,
        totalRoles: roles?.length || 0,
        totalProducts: products?.length || 0,
        totalCoalYards: coalYards?.length || 0,
        activeUsers: orgUsers?.filter(u => u.is_active).length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigation = (href: string, sectionTitle: string) => {
    setNavigatingTo(sectionTitle)
    router.push(href)
    // Clear loading state after a short delay (since router.push is not awaitable)
    setTimeout(() => {
      setNavigatingTo(null)
    }, 1000)
  }

  const adminSections = [
    {
      title: "Organizations",
      description: "Manage companies and organization settings",
      icon: Building2,
      href: "/admin/organizations",
      color: "bg-blue-500",
      count: stats.totalOrganizations
    },
    {
      title: "Products",
      description: "Manage coal products and organization links",
      icon: Package,
      href: "/admin/products",
      color: "bg-indigo-500",
      count: stats.totalProducts
    },
    {
      title: "Coal Yards",
      description: "Manage coal yards and locations",
      icon: Warehouse,
      href: "/admin/coal-yards",
      color: "bg-orange-500",
      count: stats.totalCoalYards
    },
    {
      title: "Roles",
      description: "Define user roles and permissions",
      icon: Shield,
      href: "/admin/roles",
      color: "bg-green-500",
      count: stats.totalRoles
    },
    {
      title: "Users",
      description: "Manage users and their organization assignments",
      icon: Users,
      href: "/admin/users",
      color: "bg-purple-500",
      count: stats.totalUsers
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/coal-texture.png" alt="Coal texture background" fill className="object-cover" priority />
        </div>
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.push('/dashboard')}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full overflow-hidden"
                onClick={() => router.push("/profile")}
              >
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{user?.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-light">
              <span className="font-bold">Admin</span>{" "}
              <span className="italic">dashboard.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage organizations, roles, and users</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">System:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  Administrative Control
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Statistics Overview */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalUsers}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.activeUsers}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Organizations</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalOrganizations}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Roles</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalRoles}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Sections */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminSections.map((section) => (
                <div key={section.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${section.color}`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-400">
                      {loading ? (
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                      ) : section.count}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{section.description}</p>
                  <Button 
                    onClick={() => handleNavigation(section.href, section.title)}
                    disabled={navigatingTo === section.title}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {navigatingTo === section.title ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                        Loading...
                      </div>
                    ) : (
                      `Manage ${section.title}`
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
} 
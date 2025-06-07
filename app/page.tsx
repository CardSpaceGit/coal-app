"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  BarChart3, 
  Truck, 
  Package, 
  Users, 
  Shield, 
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background */}
      <section className="relative overflow-hidden bg-gray-400">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/coal.gif"
          alt="Coal background"
          fill
          className="object-cover"
          priority
        />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Header */}
        <header className="relative z-10 w-full px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">FT</span>
              </div>
              <span className="text-white text-xl font-semibold">FT Coal</span>
      </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-white/90 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-white/90 hover:text-white transition-colors">Contact</a>
            </nav>

          <Link href="/login">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              Login
            </Button>
          </Link>
        </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-white max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
                Revolutionize Your<br />
                Coal Yard Operations
            </h1>

              <p className="text-xl md:text-2xl font-light mb-8 opacity-90 leading-relaxed max-w-3xl">
                Comprehensive coal management platform designed to ensure accuracy, 
                improve productivity, and enable data-driven decisions for your operations.
              </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/login">
                <Button 
                  size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-4 text-lg w-full sm:w-auto"
                >
                  Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-4 text-lg w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">99.9%</div>
                  <div className="text-white/80">Accuracy Rate</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
                  <div className="text-white/80">Coal Yards Managed</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                  <div className="text-white/80">Real-time Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Powerful Features for Modern Coal Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline operations, track inventory, and make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-time Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive dashboard with live data on stock levels, delivery trends, and operational metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Truck className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Delivery Management</h3>
                <p className="text-gray-600">
                  Track and manage coal deliveries with automated stock updates and detailed delivery records.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Package className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Pickup Coordination</h3>
                <p className="text-gray-600">
                  Streamline pickup operations with real-time scheduling and inventory validation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">User Management</h3>
                <p className="text-gray-600">
                  Role-based access control with organization management and secure user authentication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Security & Compliance</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with data encryption and comprehensive audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Performance Insights</h3>
                <p className="text-gray-600">
                  Advanced reporting and insights to optimize operations and improve efficiency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Built for the Coal Industry
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                FT Coal is a comprehensive management platform specifically designed for coal yard operations. 
                Our solution addresses the unique challenges of coal inventory management, logistics coordination, 
                and operational efficiency.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                With years of industry expertise, we understand the critical importance of accurate stock tracking, 
                reliable delivery management, and seamless coordination between different stakeholders in the coal supply chain.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Multi-organization support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Real-time stock synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Automated workflow management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Mobile-friendly interface</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">500K+</div>
                  <div className="text-gray-600">Tons Managed</div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">1000+</div>
                  <div className="text-gray-600">Deliveries Tracked</div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">50+</div>
                  <div className="text-gray-600">Organizations</div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-[32px] border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">99%</div>
                  <div className="text-gray-600">Uptime</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
            Ready to Transform Your Coal Operations?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join leading coal operations that trust FT Coal for their management needs.
          </p>
          <Link href="/login">
            <Button 
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-12 py-4 text-lg"
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer id="contact" className="px-6 py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">FT</span>
                </div>
                <span className="text-white text-xl font-semibold">FT Coal</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Empowering coal operations with cutting-edge management technology. 
                Built for efficiency, designed for growth.
              </p>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#about" className="block text-gray-300 hover:text-white transition-colors">About</a>
                <Link href="/login" className="block text-gray-300 hover:text-white transition-colors">Login</Link>
                <a href="#contact" className="block text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="h-5 w-5" />
                  <span>info@ftcoal.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="h-5 w-5" />
                  <span>+27 (0) 11 123 4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5" />
                  <span>Johannesburg, South Africa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 FT Coal. All rights reserved. Built and powered by FT Coal.
            </p>
        </div>
      </div>
      </footer>
    </div>
  )
}

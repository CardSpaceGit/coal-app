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
      <section className="relative overflow-hidden bg-gray-400 min-h-screen">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onCanPlay={(e) => { e.currentTarget.playbackRate = 0.8; }}
          onPlay={(e) => { e.currentTarget.playbackRate = 0.8; }}
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.8; }}
        >
          <source src="/images/coal-operations.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
          <div className="absolute inset-0 bg-black/60" />
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
        <div className="relative z-10 px-6 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="text-white">
              <h1 className="text-4xl md:text-8xl font-light leading-tight mb-6">
                Revolutionize Your<br />
                Coal Yard Operations
            </h1>

              <p className="text-md md:text-xl font-light mb-8 opacity-90 leading-relaxed">
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
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center">
            {/* Images */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12 w-full max-w-4xl">
              <div className="flex-1">
                <div className="relative h-64 bg-gray-200 rounded-2xl overflow-hidden">
                  <Image
                    src="/api/placeholder/400/300"
                    alt="Coal storage facility"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative h-64 bg-gray-200 rounded-2xl overflow-hidden">
                  <Image
                    src="/api/placeholder/400/300"
                    alt="Coal loading operations"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Copy underneath */}
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-6 leading-tight">
                We deliver more than coal management—we deliver{" "}
                <span className="text-gray-500">trust, peace of mind, and exceptional value</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Our comprehensive coal yard management solution ensures accurate inventory tracking, 
                seamless operations, and reliable data you can count on for critical business decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Screenshots Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Optimize Your Operations with Data-Driven Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get a glimpse of our powerful coal management platform in action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white rounded-[24px] border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src="/api/placeholder/600/400"
                    alt="Coal delivery analytics dashboard"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Delivery Analytics</h3>
                  <p className="text-gray-600">
                    Track delivery performance with real-time metrics and comprehensive reporting
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[24px] border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src="/api/placeholder/600/400"
                    alt="Coal inventory management interface"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Inventory Management</h3>
                  <p className="text-gray-600">
                    Monitor stock levels and manage coal inventory with precision and accuracy
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[24px] border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src="/api/placeholder/600/400"
                    alt="Coal pickup scheduling system"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Pickup Scheduling</h3>
                  <p className="text-gray-600">
                    Streamline pickup operations with intelligent scheduling and coordination tools
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[24px] border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src="/api/placeholder/600/400"
                    alt="Coal operations dashboard overview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Operations Dashboard</h3>
                  <p className="text-gray-600">
                    Get a complete overview of your coal yard operations with our comprehensive dashboard
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coal Solutions Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-4 leading-tight">
            Explore our flexible coal management options
          </h2>
          <h3 className="text-4xl md:text-5xl font-light text-gray-400 mb-8 leading-tight">
            for every need in the world
          </h3>
          
          <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
            Whether you're managing deliveries, pickups, or inventory, we offer a variety of reliable and 
            efficient coal management solutions to suit your operational requirements.
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-white rounded-[32px] border-gray-200 shadow-lg overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="absolute top-6 left-6 z-10">
                  <span className="text-6xl font-light text-white">01</span>
                </div>
                <div className="relative h-80 bg-gradient-to-br from-yellow-500 to-orange-600">
                  <Image
                    src="/api/placeholder/600/400"
                    alt="Coal delivery management"
                    fill
                    className="object-cover mix-blend-overlay"
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-3xl font-light text-white">Delivery Management</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <p className="text-lg text-gray-700 font-medium mb-2">
              Reliable and efficient coal delivery tracking across all locations,
            </p>
            <p className="text-lg text-gray-700 font-medium">
              ensuring accurate inventory and timely operations.
            </p>
          </div>

          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-3 text-lg rounded-full"
          >
            Learn More
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Description */}
            <div>
              <div className="inline-block px-6 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
                Key Metrics
              </div>
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Define Our Excellence
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe operational success begins with trust. 
                That's why we prioritize world-class coal management solutions.
              </p>
            </div>

            {/* Right side - 2x2 Grid of Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[24px] border border-gray-200">
                <div className="text-5xl md:text-6xl font-light text-gray-800 mb-4">2.5M</div>
                <p className="text-gray-600">
                  tons handled annually, connecting coal operations worldwide.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[24px] border border-gray-200">
                <div className="text-5xl md:text-6xl font-light text-gray-800 mb-4">99%</div>
                <p className="text-gray-600">
                  Deliveries arrive on time with accurate inventory tracking.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[24px] border border-gray-200">
                <div className="text-5xl md:text-6xl font-light text-gray-800 mb-4">150+</div>
                <p className="text-gray-600">
                  Serving 150+ locations, providing comprehensive coverage for all your coal needs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[24px] border border-gray-200">
                <div className="text-5xl md:text-6xl font-light text-gray-800 mb-4">24/7</div>
                <p className="text-gray-600">
                  Real-time monitoring and support for continuous operations.
                </p>
              </div>
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

      {/* Bold CTA Section */}
      <section className="px-6 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Top bar with search and quote button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="flex items-center space-x-3 bg-gray-800 rounded-full px-6 py-3 mb-4 md:mb-0">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-white">Coal Yards Nationwide, South Africa</span>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-3 rounded-full">
              Request A Quote
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - CTA */}
            <div>
              <h2 className="text-5xl md:text-6xl font-light text-white mb-8 leading-tight">
                Ready to Manage with Confidence?
              </h2>
            </div>

            {/* Right side - Navigation */}
            <div className="flex flex-wrap justify-end gap-8">
              <div className="flex items-center space-x-3 text-white hover:text-yellow-500 transition-colors cursor-pointer">
                <div className="w-6 h-6 border border-white rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                <span className="text-lg font-medium">Dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-white hover:text-yellow-500 transition-colors cursor-pointer">
                <Package className="h-6 w-6" />
                <span className="text-lg font-medium">Inventory</span>
              </div>
              <div className="flex items-center space-x-3 text-white hover:text-yellow-500 transition-colors cursor-pointer">
                <Truck className="h-6 w-6" />
                <span className="text-lg font-medium">Deliveries</span>
              </div>
              <div className="flex items-center space-x-3 text-white hover:text-yellow-500 transition-colors cursor-pointer">
                <BarChart3 className="h-6 w-6" />
                <span className="text-lg font-medium">Analytics</span>
              </div>
              <div className="flex items-center space-x-3 text-white hover:text-yellow-500 transition-colors cursor-pointer">
                <Users className="h-6 w-6" />
                <span className="text-lg font-medium">About Us</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer id="contact" className="px-6 py-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Head Office</h3>
              <div className="space-y-2 text-gray-300">
                <p>FT Coal Solutions</p>
                <p>Mining District 42</p>
                <p>2001 Johannesburg</p>
                <p>South Africa</p>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Operations Center</h3>
              <div className="space-y-2 text-gray-300">
                <p>FT Coal Operations</p>
                <p>Coal Valley Road 15</p>
                <p>2001 Johannesburg</p>
                <p>South Africa</p>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Email</h3>
              <div className="text-gray-300 text-xl font-light">
                info@ftcoal.com
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Phone</h3>
              <div className="text-gray-300 text-xl font-light">
                +27 11 520 899
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">
              © 2024 FT Coal. All rights reserved. Powered by advanced coal management technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

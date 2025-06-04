"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-400 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/coal.gif"
          alt="Coal background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen p-6">
        {/* Header with Login Button */}
        <div className="flex justify-end pt-8">
          <Link href="/login">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              Login
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-end pb-16">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-6">
              Ensure accuracy,<br />
              improve productivity,<br />
              and make informed<br />
              decisions with ease.
            </h1>

            <p className="text-lg md:text-xl font-light mb-12 opacity-90 leading-relaxed max-w-2xl">
              Designed to simplify and enhance the<br />
              management of your coal yard operations.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-3 w-full sm:w-auto"
                >
                  Get Started
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-3 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>

            <p className="text-sm opacity-75">Build and powered by FT Coal © 2024.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

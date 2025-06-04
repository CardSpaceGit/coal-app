"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-gray-400 relative overflow-hidden">
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
      <div className="relative z-10 flex flex-col justify-end min-h-screen p-6 pb-16">
        <div className="text-white">
          <h1 className="text-4xl font-light leading-tight mb-6">
            Ensure accuracy,<br />
            improve productivity,<br />
            and make informed<br />
            decisions with ease.
          </h1>

          <p className="text-lg font-light mb-12 opacity-90 leading-relaxed">
            Designed to simplify and enhance the<br />
            management of your coal yard operations.
          </p>

          {/* Navigation Button */}
          <div className="mb-16">
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-3"
              >
                Continue to Login
              </Button>
            </Link>
          </div>

          <p className="text-sm opacity-75">Build and powered by FT Coal © 2024.</p>
        </div>
      </div>
    </div>
  )
}

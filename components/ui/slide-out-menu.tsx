import React from "react"
import Image from "next/image"
import { ArrowRight, User, LayoutDashboard } from "lucide-react"

interface SlideOutMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  onProfile: () => void
  onDashboard: () => void
  isLoggingOut?: boolean
}

export function SlideOutMenu({ isOpen, onClose, onLogout, onProfile, onDashboard, isLoggingOut = false }: SlideOutMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Slide-out Panel */}
      <div
        className={`absolute left-0 top-0 h-full w-[90%] md:w-[30%] bg-gray-400 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/coal.gif"
            alt="Coal background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen p-6">
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold">
                  <span className="text-yellow-500">FT</span>
                  <span className="text-white">COAL</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium">supply & logistics</p>
            </div>

            {/* Main Content */}
            <div className="text-white mb-16">
              <h1 className="text-2xl font-light leading-tight mb-6">
                Ensure accuracy, improve productivity, and make informed decisions with ease.
              </h1>

              <p className="text-lg font-light opacity-90 leading-relaxed">
                Designed to simplify and enhance the management of your coal yard operations.
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-6">
            {/* Dashboard Button */}
            <button
              onClick={onDashboard}
              className="flex items-center justify-between w-full text-white text-xl font-light py-4 border-b border-white/20"
            >
              <span>Dashboard</span>
              <ArrowRight size={24} />
            </button>

            {/* Profile Button */}
            <button
              onClick={onProfile}
              className="flex items-center justify-between w-full text-white text-xl font-light py-4 border-b border-white/20"
            >
              <span>Profile</span>
              <ArrowRight size={24} />
            </button>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-between w-full text-white text-xl font-light py-4 border-b border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
              {isLoggingOut ? (
                <div className="w-6 h-6 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <ArrowRight size={24} />
              )}
            </button>

            {/* Footer */}
            <p className="text-sm text-white/75">Build and powered by FT Coal © 2025.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
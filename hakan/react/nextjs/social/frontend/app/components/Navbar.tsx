"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  User,
  Newspaper,
  Image,
  Video,
  MessageSquare,
  Settings,
} from "lucide-react";
import AuthModal from "./AuthModal";
interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { label: "Feed", href: "/feed", icon: Home },
  { label: "Profile", href: "/profile", icon: User },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Photo", href: "/photo", icon: Image },
  { label: "Video", href: "/video", icon: Video },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-16 bg-white border-b border-gray-200 px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 tracking-tight"
          >
            LamaSocial
          </Link>

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sağ Butonlar */}
          <div className="flex items-center gap-3">
            {/* Join Butonu Modal'ı açar */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            >
              Join
            </button>
            {/* Mobil Menü Butonu... */}
          </div>

          {/* Mobile Menü Butonu (Sadece Mobilde Görünür) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Overlay Menü */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      {/* Popup / Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

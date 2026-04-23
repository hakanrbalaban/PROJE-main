"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in duration-200">
        
        {/* Kapatma Butonu */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            {isLogin ? "LamaSocial'a Giriş Yap" : "Yeni Hesap Oluştur"}
          </h2>

          <form className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            <input
              type="email"
              placeholder="E-posta"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Şifre"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-500 hover:underline"
            >
              {isLogin ? "Hesabın yok mu? Buradan Kaydol" : "Zaten üye misin? Giriş yap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
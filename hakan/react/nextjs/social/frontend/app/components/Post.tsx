"use client";
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, ExternalLink, Video, Image } from "lucide-react";

export default function Post() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col gap-4">
      {/* Üst Kısım */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">LamaSocial User</span>
            <span className="text-xs text-gray-400">2 saat önce</span>
          </div>
        </div>
        <button className="text-blue-500 text-xs font-bold px-3 py-1 border border-blue-500 rounded-full hover:bg-blue-50">Takip Et</button>
      </div>

      {/* İçerik */}
      <p className="text-sm text-gray-700">Harika bir gün! #coding #nextjs</p>
      <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden border">
         <img src="/post.jpeg" className="w-full h-full object-cover" alt="post" />
      </div>

      {/* Etkileşim Butonları */}
      <div className="flex items-center justify-between text-gray-500 border-y py-2">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 hover:text-red-500"><Heart size={20}/> <span className="text-xs">120</span></button>
          <button className="flex items-center gap-1 hover:text-blue-500"><MessageCircle size={20}/> <span className="text-xs">15</span></button>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-green-500" title="Site içi tekrar paylaş"><Repeat2 size={20}/> <span className="text-xs">3</span></button>
          <button className="flex items-center gap-1 hover:text-blue-400" title="Dışarıda paylaş"><ExternalLink size={20}/></button>
        </div>
      </div>

      {/* Yorumlar ve Yorum Yazma */}
      <div className="flex flex-col gap-3">
         <div className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg relative">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            <input 
              placeholder="Yorum yap... (resim/video için ikonları kullan)" 
              className="bg-transparent flex-1 text-xs outline-none py-1"
            />
            <div className="flex gap-2 text-gray-400">
               <Image size={16} className="cursor-pointer hover:text-blue-500"/>
               <Video size={16} className="cursor-pointer hover:text-red-500"/>
            </div>
         </div>
      </div>
    </div>
  );
}
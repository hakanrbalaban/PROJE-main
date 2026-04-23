"use client";
import { Image, Video, Link2, FileText, Smile, Send } from "lucide-react";

export default function AddPost() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" /> {/* Avatar */}
        <textarea 
          placeholder="Neler düşünüyorsun?" 
          className="flex-1 bg-gray-50 rounded-lg p-2 text-sm outline-none resize-none h-20"
        />
      </div>
      
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-4 text-gray-500">
          <label className="cursor-pointer hover:text-blue-500"><Image size={20}/><input type="file" hidden accept="image/*"/></label>
          <label className="cursor-pointer hover:text-red-500"><Video size={20}/><input type="file" hidden accept="video/*"/></label>
          <button className="hover:text-green-500"><Link2 size={20}/></button>
          <button className="hover:text-yellow-500"><Smile size={20}/></button>
          <label className="cursor-pointer hover:text-purple-500"><FileText size={20}/><input type="file" hidden/></label>
        </div>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium flex items-center gap-2">
          Paylaş <Send size={16}/>
        </button>
      </div>
    </div>
  );
}
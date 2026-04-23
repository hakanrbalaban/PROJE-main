import AddPost from "./components/AddPost";
import Post from "./components/Post";
import Stories from "./components/Stories";

export default function Home() {
  return (
    <div className="flex gap-6 max-w-6xl mx-auto pt-4">
      {/* Orta Feed (70%) */}
      <div className="w-full lg:w-[70%] flex flex-col gap-6">
        <Stories />
        <AddPost />
        <Post />
        <Post />
      </div>

      {/* Right Menu (30%) - Sadece Geniş Ekranlarda */}
      <div className="hidden lg:flex flex-col w-[30%] gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-bold mb-4">Takip Önerileri</h2>
          {/* Öneri Listesi Buraya */}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm sticky top-20">
          <h2 className="font-bold mb-4">Gündem</h2>
          <ul className="text-sm space-y-3">
            <li className="text-blue-500 font-medium cursor-pointer">#NextJS2026</li>
            <li className="text-blue-500 font-medium cursor-pointer">#LamaSocial</li>
            <li className="text-blue-500 font-medium cursor-pointer">#MuğlaMarmaris</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      // Backend URL'niz: http://localhost:8800
      const res = await fetch(`http://localhost:8800${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir şeyler yanlış gitti.");
      }

      if (isLogin) {
        // Giriş başarılıysa kullanıcıyı ana sayfaya yönlendir
        router.push("/");
      } else {
        // Kayıt başarılıysa login moduna geç
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                required
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
          </div>

          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">
            {isLogin ? "Giriş Yap" : "Kaydol"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-500 hover:underline"
          >
            {isLogin ? "Hesabın yok mu? Kaydol" : "Zaten üyen misin? Giriş yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
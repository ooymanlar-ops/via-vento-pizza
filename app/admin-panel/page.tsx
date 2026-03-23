"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Check, X, Trash2, LogOut, MessageSquare, Clock, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react"
import { supabase, type Review, getAllReviews, updateReviewStatus, deleteReview } from "@/lib/supabase"

// Admin giriş bilgileri
// Gerçek uygulamada bu bilgiler .env dosyasında saklanmalı veya Supabase Auth kullanılmalı
const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER || "viavento"
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "ankara2026"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)

  useEffect(() => {
    // Session kontrolü
    const auth = sessionStorage.getItem("viavento_admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
      checkDbConnection()
      loadReviews()
    }
  }, [])

  // Veritabanı bağlantısını kontrol et
  const checkDbConnection = async () => {
    try {
      const { error } = await supabase.from('reviews').select('count').limit(1)
      setDbConnected(!error)
    } catch {
      setDbConnected(false)
    }
  }

  const loadReviews = async () => {
    setLoading(true)
    const data = await getAllReviews()
    setReviews(data)
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true)
      sessionStorage.setItem("viavento_admin_auth", "true")
      checkDbConnection()
      loadReviews()
      setError("")
    } else {
      setError("Kullanıcı adı veya şifre hatalı!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("viavento_admin_auth")
    setUsername("")
    setPassword("")
  }

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id)
    const result = await updateReviewStatus(id, status)
    if (result.success) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return
    
    setActionLoading(id)
    const result = await deleteReview(id)
    if (result.success) {
      setReviews(prev => prev.filter(r => r.id !== id))
    }
    setActionLoading(null)
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true
    return review.status === filter
  })

  const pendingCount = reviews.filter(r => r.status === "pending").length
  const approvedCount = reviews.filter(r => r.status === "approved").length

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-[#E8D5B7] mb-2">Via Vento</h1>
              <p className="text-zinc-500 text-sm">Admin Panel Girişi</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E8D5B7] transition text-white"
                  placeholder="Kullanıcı adınız"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-[#E8D5B7] transition text-white"
                    placeholder="Şifreniz"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#E8D5B7] text-black py-4 rounded-xl font-bold hover:bg-white transition"
              >
                Giriş Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#E8D5B7]">Via Vento Admin</h1>
            <p className="text-zinc-500 text-sm">Yorum Yönetim Paneli</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadReviews}
              disabled={loading}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              <span className="hidden md:inline">Yenile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* DB Connection Status */}
      {dbConnected === false && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-yellow-500">Veritabanı Bağlantısı Kurulamadı</h4>
              <p className="text-yellow-500/80 text-sm mt-1">
                Supabase bağlantısı yapılandırılmamış. Lütfen aşağıdaki adımları takip edin:
              </p>
              <ol className="text-yellow-500/80 text-sm mt-2 list-decimal list-inside space-y-1">
                <li>Supabase Dashboard{"'"}tan yeni bir proje oluşturun</li>
                <li>SQL Editor{"'"}da <code className="bg-yellow-500/20 px-1 rounded">scripts/001_create_reviews_table.sql</code> dosyasını çalıştırın</li>
                <li><code className="bg-yellow-500/20 px-1 rounded">.env.local</code> dosyasına URL ve Key ekleyin:</li>
              </ol>
              <pre className="bg-black/30 rounded-lg p-3 mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-zinc-500 text-sm">Onay Bekliyor</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-zinc-500 text-sm">Onaylanmış</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-zinc-500 text-sm">Toplam Yorum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "Tümü" },
            { value: "pending", label: "Onay Bekliyor" },
            { value: "approved", label: "Onaylı" },
            { value: "rejected", label: "Reddedildi" }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                filter === f.value 
                  ? "bg-[#E8D5B7] text-black" 
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw size={32} className="mx-auto text-zinc-500 animate-spin mb-4" />
              <p className="text-zinc-500">Yorumlar yükleniyor...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">Bu kategoride yorum bulunmuyor</p>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div 
                key={review.id} 
                className={`bg-zinc-900 rounded-xl p-5 border border-white/10 transition ${
                  actionLoading === review.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold">{review.customer_name}</h4>
                    <p className="text-zinc-500 text-sm">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={i < review.rating ? "text-yellow-500" : "text-zinc-700"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-zinc-300 mb-4">{review.comment}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                    review.status === "approved" ? "bg-green-500/20 text-green-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {review.status === "pending" ? "Onay Bekliyor" :
                     review.status === "approved" ? "Onaylandı" : "Reddedildi"}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(review.id, "approved")}
                          disabled={actionLoading === review.id}
                          className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition disabled:opacity-50"
                          title="Onayla"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(review.id, "rejected")}
                          disabled={actionLoading === review.id}
                          className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                          title="Reddet"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {review.status === "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, "approved")}
                        disabled={actionLoading === review.id}
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition disabled:opacity-50"
                        title="Onayla"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {review.status === "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, "rejected")}
                        disabled={actionLoading === review.id}
                        className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition disabled:opacity-50"
                        title="Yayından Kaldır"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="p-2 bg-zinc-800 text-zinc-500 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-white/5 mt-8">
        <details className="bg-zinc-900/50 rounded-xl border border-white/10">
          <summary className="p-4 cursor-pointer text-zinc-400 hover:text-white transition font-medium">
            Supabase Kurulum Talimatları
          </summary>
          <div className="p-4 pt-0 text-sm text-zinc-500 space-y-4">
            <div>
              <h4 className="font-bold text-zinc-300 mb-2">1. Supabase Projesi Oluşturun</h4>
              <p>supabase.com adresine gidin ve yeni bir proje oluşturun.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-300 mb-2">2. Veritabanı Tablosunu Oluşturun</h4>
              <p>SQL Editor{"'"}a gidin ve <code className="bg-zinc-800 px-1 rounded">scripts/001_create_reviews_table.sql</code> dosyasındaki SQL{"'"}i çalıştırın.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-300 mb-2">3. Environment Variables Ekleyin</h4>
              <p>Project Settings {">"} API bölümünden URL ve anon key{"'"}i alın.</p>
              <p className="mt-2"><code className="bg-zinc-800 px-1 rounded">.env.local</code> dosyası oluşturun:</p>
              <pre className="bg-zinc-800 rounded-lg p-3 mt-2 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </div>
            <div>
              <h4 className="font-bold text-zinc-300 mb-2">4. RLS Policy{"'"}leri Düzenleyin (Opsiyonel)</h4>
              <p>Admin işlemleri için service_role key kullanabilir veya Supabase Auth ile giriş yapan admin kullanıcıları için özel policy{"'"}ler ekleyebilirsiniz.</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

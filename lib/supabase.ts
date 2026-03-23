import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase yapılandırması
// Bu değerleri Supabase Dashboard'dan alıp environment variables olarak eklemeniz gerekiyor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase bağlantısının hazır olup olmadığını kontrol et
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  supabaseUrl.includes('supabase')
)

// Supabase client - lazy initialization ile oluştur (ASLA doğrudan createClient çağırma)
let _supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null
  }
  if (!_supabaseClient) {
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabaseClient
}

// Admin panel icin geriye donuk uyumluluk - supabase export'u
export const supabase = isSupabaseConfigured ? getSupabaseClient() : null

// Yorum tipi
export interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

// Yorumları getir (sadece onaylı olanlar - ana sayfa için)
export async function getApprovedReviews(): Promise<Review[]> {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Yorumlar yüklenirken hata:', error)
    return []
  }

  return data || []
}

// Tüm yorumları getir (admin panel için)
export async function getAllReviews(): Promise<Review[]> {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Yorumlar yüklenirken hata:', error)
    return []
  }

  return data || []
}

// Yeni yorum ekle
export async function addReview(review: {
  customer_name: string
  rating: number
  comment: string
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient()
  if (!client) {
    return { success: false, error: 'Supabase yapılandırılmamış' }
  }

  const { error } = await client
    .from('reviews')
    .insert([
      {
        customer_name: review.customer_name,
        rating: review.rating,
        comment: review.comment,
        status: 'pending'
      }
    ])

  if (error) {
    console.error('Yorum eklenirken hata:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Yorum durumunu güncelle (admin panel için)
export async function updateReviewStatus(
  id: string, 
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient()
  if (!client) {
    return { success: false, error: 'Supabase yapılandırılmamış' }
  }

  const { error } = await client
    .from('reviews')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Yorum durumu güncellenirken hata:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Yorum sil (admin panel için)
export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient()
  if (!client) {
    return { success: false, error: 'Supabase yapılandırılmamış' }
  }

  const { error } = await client
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Yorum silinirken hata:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

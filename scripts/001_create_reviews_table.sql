-- Via Vento Yorumlar Tablosu
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Reviews tablosunu oluştur
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) etkinleştir
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Herkes onaylanmış yorumları görebilsin (ana sayfa için)
CREATE POLICY "Onaylanan yorumlar herkese açık" ON reviews
  FOR SELECT
  USING (status = 'approved');

-- Anonymous kullanıcılar yorum ekleyebilsin
CREATE POLICY "Herkes yorum ekleyebilir" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Admin işlemleri için service_role key kullanılacak
-- Veya authenticated kullanıcılar için ayrı policy eklenebilir

-- Örnek yorumlar ekle (isteğe bağlı)
INSERT INTO reviews (customer_name, rating, comment, status) VALUES
  ('Ahmet Y.', 5, 'Napoli pizzası muhteşemdi! Hamuru çok ince ve lezzetli. Kesinlikle tekrar sipariş vereceğim.', 'approved'),
  ('Elif K.', 4, 'Teslimat hızlıydı, pizza sıcak geldi. Pepperoni favorim oldu!', 'approved'),
  ('Mehmet S.', 5, 'Eryaman''da en iyi pizza burası. Quattro Formaggi''yi denemelisiniz!', 'pending'),
  ('Zeynep A.', 5, 'Çocuklar bayıldı! Ailece favorimiz oldu Via Vento.', 'approved'),
  ('Can B.', 4, 'Lezzetli ama biraz geç geldi. Yine de tavsiye ederim.', 'pending');

-- İndeks ekle (performans için)
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

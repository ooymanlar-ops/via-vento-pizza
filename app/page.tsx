"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ShoppingCart, Info, X, ChevronRight, Instagram, CreditCard, CheckCircle, ArrowLeft, Star, Loader2, Send } from "lucide-react"

const PIZZAS = [
  {
    id: 1,
    name: "Margherita",
    description: "48 saat soğuk fermente hamur, özel San Marzano sosu, taze manda mozzarellası ve fesleğen.",
    price: 400,
    image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Özel Fermantasyon Hamur", "San Marzano Sos", "Manda Mozzarellası", "Fesleğen", "Zeytinyağı"]
  },
  {
    id: 2,
    name: "Via Vento Special",
    description: "İtalyan dana salamı, mantar, siyah zeytin ve közlenmiş biberin muhteşem uyumu.",
    price: 440,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Mozzarella", "Dana Salam", "Mantar", "Köz Biber", "Zeytin"]
  },
  {
    id: 3,
    name: "Quattro Formaggi",
    description: "Dört özel peynirin buluşması: Mozzarella, Gorgonzola, Parmesan ve Ricotta.",
    price: 450,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Mozzarella", "Gorgonzola", "Parmesan", "Ricotta", "Bal"]
  },
  {
    id: 4,
    name: "Diavola",
    description: "Acı sevenler için özel hazırlanan baharatlı sucuk ve acı biber kombinasyonu.",
    price: 450,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Mozzarella", "Acılı Sucuk", "Jalapeno", "Acı Biber Sosu", "Fesleğen"]
  },
  {
    id: 5,
    name: "Prosciutto e Funghi",
    description: "İtalyan jambon ve taze mantarın klasik buluşması.",
    price: 430,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Mozzarella", "Prosciutto", "Mantar", "Roka", "Parmesan"]
  },
  {
    id: 6,
    name: "Vegetariana",
    description: "Mevsim sebzeleriyle hazırlanan sağlıklı ve lezzetli vejetaryen seçenek.",
    price: 420,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=1000&auto=format&fit=crop",
    ingredients: ["Mozzarella", "Domates", "Biber", "Mantar", "Zeytin", "Soğan"]
  }
]

interface Pizza {
  id: number
  name: string
  description: string
  price: number
  image: string
  ingredients: string[]
}

interface CartItem extends Pizza {
  quantity: number
}

type ViewState = "cart" | "checkout" | "success" | "loading"
type LegalModal = "iptal" | "mesafeli" | "gizlilik" | null

interface Review {
  id: number
  pizzaId: number
  name: string
  rating: number
  comment: string
  date: string
}

export default function ViaVentoShop() {
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartView, setCartView] = useState<ViewState>("cart")
  const [legalModal, setLegalModal] = useState<LegalModal>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" })
  
  const [formData, setFormData] = useState({
    adSoyad: "",
    telefon: "",
    mahalle: "",
    siteBlok: "",
    daire: "",
    siparisNotu: ""
  })
useEffect(() => {
    if (selectedPizza) {
      window.history.pushState({ modalOpen: true }, "")
      const handlePopState = () => setSelectedPizza(null)
      window.addEventListener("popstate", handlePopState)
      return () => window.removeEventListener("popstate", handlePopState)
    }
  }, [selectedPizza])
  const addToCart = (pizza: Pizza) => {
    const existingItem = cart.find(item => item.id === pizza.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === pizza.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...pizza, quantity: 1 }])
    }
    setSelectedPizza(null)
    setIsCartOpen(true)
  }

  const removeFromCart = (pizzaId: number) => {
    setCart(cart.filter(item => item.id !== pizzaId))
  }

  const updateQuantity = (pizzaId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === pizzaId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    setCartView("checkout")
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.adSoyad || !formData.telefon || !formData.mahalle || !formData.siteBlok || !formData.daire) {
      return
    }
    
    // Show loading screen
    setCartView("success")
    
    const orderItems = cart.map(item => `${item.quantity}x ${item.name} (${item.price * item.quantity} TL)`).join("%0A")
    const address = `${formData.mahalle}, ${formData.siteBlok}, Daire: ${formData.daire}`
    const note = formData.siparisNotu ? `%0ASipariş Notu: ${formData.siparisNotu}` : ""
    
    const message = `Merhaba, sipariş vermek istiyorum:%0A%0A${orderItems}%0A%0AToplam: ${totalPrice} TL%0A%0AAd Soyad: ${formData.adSoyad}%0ATelefon: ${formData.telefon}%0AAdres: ${address}${note}`
    
    window.location.href = `https://wa.me/905323081910?text=${message}`
  }
  const handleSubmitReview = (pizzaId: number) => {
    if (!reviewForm.name || !reviewForm.comment) return
    
    const newReview: Review = {
      id: Date.now(),
      pizzaId,
      name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toLocaleDateString("tr-TR")
    }
    
    setReviews([...reviews, newReview])
    setReviewForm({ name: "", rating: 5, comment: "" })
  }

  const handleSuccessClose = () => {
    setIsCartOpen(false)
    setCartView("cart")
    setCart([])
    setFormData({
      adSoyad: "",
      telefon: "",
      mahalle: "",
      siteBlok: "",
      daire: "",
      siparisNotu: ""
    })
  }

  const closeCart = () => {
    if (cartView === "success") {
      handleSuccessClose()
    } else {
      setIsCartOpen(false)
      setCartView("cart")
    }
  }

  const legalContent = {
    iptal: {
      title: "İptal ve İade Koşulları",
      content: `VIA VENTO PIZZA - İPTAL VE İADE KOŞULLARI

1. SİPARİŞ İPTALİ
Siparisinizi, hazirlik surecine baslanmadan once iptal edebilirsiniz. Hazirlik basladiktan sonra iptal talepleri degerlendirmeye alinmayacaktir.

2. İADE KOŞULLARI
- Ürün teslimatinda herhangi bir sorun yasanması halinde, teslimat anında kurye ile birlikte tutanak tutulması gerekmektedir.
- Hatali veya eksik urun teslimatlarinda, ayni gun icinde tarafimiza bildirilmesi halinde ucretsiz yeniden gonderim yapılacaktır.
- Musteri kaynakli (yanlis adres, ulasilamama vb.) sebeplerle gerceklesemeyen teslimatlardan Via Vento Pizza sorumlu degildir.

3. ODEME IADESI
- Iptal edilen siparislerde odeme iadesi, odeme yontemine bagli olarak 3-7 is gunu icerisinde gerceklestirilir.
- Kredi karti ile yapilan odemelerde iade, ilgili banka prosedurlerine tabidir.

4. ILETISIM
Tum iptal ve iade talepleriniz icin Instagram @viaventopizza hesabimizdan bizimle iletisime gecebilirsiniz.

Son Guncelleme: Ocak 2026`
    },
    mesafeli: {
      title: "Mesafeli Satis Sozlesmesi",
      content: `VIA VENTO PIZZA - MESAFELI SATIS SOZLESMESI

MADDE 1 - TARAFLAR

SATICI:
Unvan: Via Vento Pizza
Adres: Seker Mahallesi 1434. Sokak 23/2, Etimesgut / Ankara
Instagram: @viaventopizza

ALICI:
Siparis formunda belirtilen kisi

MADDE 2 - KONU
Isbu sozlesmenin konusu, ALICI'nin SATICI'ya ait web sitesinden elektronik ortamda siparisini verdigi urunlerin satisi ve teslimi ile ilgili olarak 6502 sayili Tuketicinin Korunmasi Hakkinda Kanun ve Mesafeli Sozlesmeler Yonetmeligi hukumleri geregince taraflarin hak ve yukumluluklerinin belirlenmesidir.

MADDE 3 - URUN BILGILERI
Urunlerin cinsi, miktari, fiyati ve teslimat bilgileri siparis onayinda belirtilmistir.

MADDE 4 - TESLIMAT
- Teslimat sadece Eryaman bolgesine yapilmaktadir.
- Teslimat suresi siparis onayindan itibaren ortalama 45-60 dakikadir.
- Yogun saatlerde teslimat suresi uzayabilir.

MADDE 5 - CAYMA HAKKI
Gida urunleri, nitelikleri itibariyle iade edilemeyecek urunlerdendir. Ancak hatali veya ayipli urun teslimatlarinda degisim yapilmaktadir.

MADDE 6 - ODEME
Odeme, online odeme sistemi uzerinden kredi karti/banka karti ile yapilmaktadir.

Son Guncelleme: Ocak 2026`
    },
    gizlilik: {
      title: "Gizlilik Politikasi",
      content: `VIA VENTO PIZZA - GIZLILIK POLITIKASI

1. TOPLANAN BILGILER
Siparis surecinde asagidaki bilgiler toplanmaktadir:
- Ad Soyad
- Telefon Numarasi
- Teslimat Adresi
- Siparis Detaylari

2. BILGILERIN KULLANIMI
Toplanan bilgiler yalnizca:
- Siparisinizin hazirlanmasi ve teslim edilmesi
- Sizinle iletisim kurulmasi
- Yasal yukumluluklerin yerine getirilmesi
amaciyla kullanilmaktadir.

3. BILGI GUVENLIGI
- Kisisel bilgileriniz SSL sertifikasi ile korunmaktadir.
- Odeme bilgileriniz tarafimizca saklanmamakta, PayTR guvenli odeme altyapisi uzerinden islenmektedir.
- Bilgileriniz ucuncu sahislarla paylasilmamaktadir.

4. CEREZLER
Web sitemizde kullanici deneyimini iyilestirmek amaciyla cerezler kullanilabilmektedir.

5. HAKLARINIZ
6698 sayili Kisisel Verilerin Korunmasi Kanunu kapsaminda;
- Kisisel verilerinizin islenip islenmedigini ogrenme
- Islenmisse buna iliskin bilgi talep etme
- Duzeltilmesini veya silinmesini isteme
haklarina sahipsiniz.

6. ILETISIM
Gizlilik politikamiz hakkinda sorulariniz icin Instagram @viaventopizza hesabimizdan bize ulasabilirsiniz.

Son Guncelleme: Ocak 2026`
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#E8D5B7] selection:text-black">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <Image
            src="/images/logo.png"
            alt="Via Vento Logo"
            width={40}
            height={40}
            className="rounded-full w-8 h-8 md:w-10 md:h-10"
            priority
          />
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#E8D5B7] italic">VIA VENTO</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2 hover:bg-white/10 rounded-full transition active:scale-95"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E8D5B7] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO SECTION WITH VIDEO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/hero-video.mp4" type="video/mp4" />
</video>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.85)_70%,rgba(0,0,0,0.95)_100%)]" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto pt-20">
          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 tracking-tight text-balance leading-tight"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.9)' }}
          >
            Eryaman{"'"}ın kalbinde, sadece en iyi malzemelerle hazırlanan{' '}
            <span className="text-[#E8D5B7]">butik pizza deneyimi.</span>
          </h2>
          <p 
            className="text-lg md:text-2xl text-zinc-200 mb-10 md:mb-12 font-medium"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
          >
            Dükkanımız dijital, lezzetimiz gerçek.
          </p>
          <a 
            href="#menu" 
            className="inline-flex items-center gap-2 bg-white text-black px-8 md:px-10 py-4 md:py-5 rounded-full font-bold hover:bg-[#E8D5B7] hover:text-black transition-all transform hover:scale-105 active:scale-95 text-base md:text-lg shadow-2xl"
            style={{ boxShadow: '0 10px 50px rgba(232,213,183,0.3)' }}
          >
            SİPARİŞE BAŞLA <ChevronRight size={24} />
          </a>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="px-4 md:px-6 py-16 md:py-20 max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h3 className="text-2xl md:text-4xl font-black mb-4">MENÜ</h3>
          <p className="text-zinc-500 text-sm md:text-base">Tüm pizzalarımız 48 saat fermente hamur ile hazırlanır</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PIZZAS.map((pizza) => (
           <div
  key={pizza.id}
  onClick={() => setSelectedPizza(pizza)}
  className="group relative bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-[#E8D5B7]/50 transition-all cursor-pointer"
>
              <div className="aspect-square overflow-hidden">
                <Image 
                  src={pizza.image} 
                  alt={pizza.name} 
                  width={500}
                  height={500}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={pizza.id <= 3}
                />
              </div>
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg md:text-xl font-bold">{pizza.name}</h3>
                  <span className="text-[#E8D5B7] font-black text-sm md:text-base">{pizza.price} TL</span>
                </div>
                <p className="text-zinc-500 text-xs md:text-sm line-clamp-2 mb-5 md:mb-6">{pizza.description}</p>
                <button
  className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition active:scale-95 text-sm md:text-base"
>
  <Info size={18} /> İncele & Ekle
</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PIZZA DETAIL MODAL */}
      {selectedPizza && (
        <div 
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={() => setSelectedPizza(null)}
        >
          <div 
            className="bg-zinc-900 border border-white/10 w-full max-w-2xl md:rounded-[40px] rounded-t-[40px] overflow-hidden relative shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPizza(null)} 
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-black/50 rounded-full hover:bg-white/10 z-10 active:scale-90"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 aspect-square relative">
                <Image 
                  src={selectedPizza.image} 
                  alt={selectedPizza.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-5 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl md:text-3xl font-black mb-2">{selectedPizza.name}</h2>
                  <p className="text-[#E8D5B7] text-lg md:text-2xl font-black mb-4">{selectedPizza.price} TL</p>
                  <p className="text-zinc-400 mb-5 md:mb-6 text-sm">{selectedPizza.description}</p>
                  <div className="mb-5 md:mb-6">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-3">Icindekiler</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPizza.ingredients.map(ing => (
                        <span key={ing} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => addToCart(selectedPizza)}
                  className="w-full bg-[#E8D5B7] text-black hover:bg-[#D4C4A8] py-4 rounded-2xl font-bold transition shadow-lg shadow-[#E8D5B7]/20 active:scale-95"
                >
                  SEPETE EKLE
                </button>
              </div>
            </div>
            
            {/* Review Section */}
            <div className="border-t border-white/10 p-5 md:p-8">
              <h4 className="text-lg font-black mb-4">Musteri Deneyimleri</h4>
              
              {/* Existing Reviews */}
              {reviews.filter(r => r.pizzaId === selectedPizza.id).length > 0 ? (
                <div className="space-y-4 mb-6">
                  {reviews.filter(r => r.pizzaId === selectedPizza.id).map(review => (
                    <div key={review.id} className="bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{review.name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? "text-[#E8D5B7] fill-[#E8D5B7]" : "text-zinc-600"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm">{review.comment}</p>
                      <p className="text-zinc-600 text-xs mt-2">{review.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 p-6 rounded-xl text-center mb-6">
                  <p className="text-zinc-500 text-sm">Bu lezzeti ilk degerlendiren siz olun!</p>
                </div>
              )}
              
              {/* Review Form */}
              <div className="bg-zinc-800/50 p-4 rounded-xl">
                <h5 className="font-bold text-sm mb-3">Yorum Yaz</h5>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Adiniz"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm">Puan:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({...reviewForm, rating: star})}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star 
                            size={20} 
                            className={star <= reviewForm.rating ? "text-[#E8D5B7] fill-[#E8D5B7]" : "text-zinc-600"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Yorumunuz..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmitReview(selectedPizza.id)}
                    disabled={!reviewForm.name || !reviewForm.comment}
                    className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Send size={16} /> Gonder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={closeCart} />
          <div className="relative w-full max-w-md bg-zinc-900 h-full overflow-y-auto flex flex-col">
            <div className="p-5 md:p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              {cartView === "checkout" && (
                <button 
                  onClick={() => setCartView("cart")} 
                  className="p-2 hover:bg-white/10 rounded-full mr-2 active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-xl md:text-2xl font-black flex-1">
                {cartView === "cart" && "Sepetim"}
                {cartView === "checkout" && "Teslimat Bilgileri"}
                {cartView === "loading" && "Ödeme İşleniyor"}
                {cartView === "success" && "Sipariş Onaylandı"}
              </h2>
              <button onClick={closeCart} className="p-2 hover:bg-white/10 rounded-full active:scale-90">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {cartView === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="mx-auto mb-4 text-zinc-600" />
                      <p className="text-zinc-500">Sepetiniz bos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-2xl">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate text-sm md:text-base">{item.name}</h4>
                            <p className="text-[#E8D5B7] font-bold text-sm">{item.price} TL</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-90"
                              >
                                -
                              </button>
                              <span className="font-bold w-6 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 hover:bg-white/10 rounded-full h-fit flex-shrink-0 active:scale-90"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {cartView === "checkout" && (
                <form id="checkoutForm" onSubmit={handlePayment} className="space-y-4 pb-20">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Ad Soyad *</label>
                    <input type="text" required value={formData.adSoyad} onChange={(e) => setFormData({...formData, adSoyad: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition text-base" placeholder="Adiniz Soyadiniz" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Telefon *</label>
                    <input type="tel" required value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition text-base" placeholder="05XX XXX XX XX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Mahalle *</label>
                    <input type="text" required value={formData.mahalle} onChange={(e) => setFormData({...formData, mahalle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition text-base" placeholder="Eryaman bolgesi mahalle adi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Site / Blok *</label>
                    <input type="text" required value={formData.siteBlok} onChange={(e) => setFormData({...formData, siteBlok: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition text-base" placeholder="Site adi ve blok numarasi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Daire No *</label>
                    <input type="text" required value={formData.daire} onChange={(e) => setFormData({...formData, daire: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition text-base" placeholder="Daire numarasi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Sipariş Notu</label>
                    <textarea value={formData.siparisNotu} onChange={(e) => setFormData({...formData, siparisNotu: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8D5B7]/50 transition resize-none text-base" rows={3} placeholder="Ekstra istekleriniz (opsiyonel)" />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-zinc-500 mb-3 text-center uppercase tracking-widest">Guvenli odeme</p>
                    <div className="flex items-center justify-center gap-4 grayscale opacity-50">
                      <span className="text-white font-black text-xs">VISA</span>
                      <span className="text-white font-black text-xs">MASTERCARD</span>
                      <span className="text-white font-black text-xs">TROY</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-3 text-center uppercase italic">PayTR Altyapısı Kullanılmaktadır</p>
                  </div>
                </form>
              )}

              {cartView === "loading" && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-[#E8D5B7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 size={40} className="text-[#E8D5B7] animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Hazırlanıyor...</h3>
                  <p className="text-zinc-500 text-sm px-8">WhatsApp'a yönlendiriliyorsunuz, lütfen bekleyin.</p>
                </div>
              )}

              {cartView === "success" && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                    <span className="text-green-500 text-4xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-black mb-6 text-white italic">YÖNLENDİRİLDİNİZ!</h2>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-8 text-center">
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                      Siparişinizin onaylanması için WhatsApp mesajını <br/>
                      <strong className="text-orange-500 underline text-base uppercase">Göndermeniz Şarttır.</strong>
                    </p>
                    <div className="bg-black/40 rounded-2xl p-4 mb-4">
                      <p className="text-zinc-500 text-[10px] uppercase mb-1">Toplam Tutar</p>
                      <p className="text-[#E8D5B7] font-black text-xl">{totalPrice} TL</p>
                    </div>
                    <p className="text-zinc-500 text-xs italic leading-relaxed">
                      Ödeme linki mesajınızdan sonra <br /> size gönderilecektir.
                    </p>
                  </div>
                  <button onClick={closeCart} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold text-zinc-400 transition">
                    KAPAT VE MENÜYE DÖN
                  </button>
                </div>
              )}
            </div>

           {/* Bottom Actions */}
            {cart.length > 0 && cartView !== "success" && cartView !== "loading" && (
              <div className="border-t border-white/10 p-5 md:p-6 flex-shrink-0 bg-zinc-950">
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-zinc-500 font-medium">Toplam</span>
                  <span className="text-2xl font-black text-[#E8D5B7]">{totalPrice} TL</span>
                </div>
                
                {cartView === "cart" ? (
                  <button 
                    onClick={handleCheckout} 
                    className="w-full bg-[#E8D5B7] text-black hover:bg-white py-4 rounded-2xl font-black transition active:scale-95 shadow-lg shadow-orange-950/20"
                  >
                    SİPARİŞİ TAMAMLA
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    form="checkoutForm" 
                    className="w-full bg-[#E8D5B7] text-black hover:bg-white py-4 rounded-2xl font-black transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    WHATSAPP'A GİT
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {legalModal && (
        <div 
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl p-0 md:p-4"
          onClick={() => setLegalModal(null)}
        >
          <div 
            className="bg-zinc-900 border border-white/10 w-full max-w-2xl md:rounded-3xl rounded-t-3xl overflow-hidden relative shadow-2xl h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg md:text-xl font-black">{legalContent[legalModal].title}</h2>
              <button 
                onClick={() => setLegalModal(null)} 
                className="p-2 hover:bg-white/10 rounded-full active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-5 md:p-6 overflow-y-auto flex-1">
              <pre className="text-zinc-400 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {legalContent[legalModal].content}
              </pre>
            </div>
            <div className="p-5 md:p-6 border-t border-white/10 flex-shrink-0">
              <button 
                onClick={() => setLegalModal(null)}
                className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-medium transition active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORY SECTION */}
      <section className="bg-zinc-900/50 py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-4xl font-black mb-8 text-[#E8D5B7]">Bir Tutkunun Hikayesi</h3>
          <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-6">
            Her şey 5 yıl önce, kendi mutfağımızdaki o küçük ankastre fırında başladı...
          </p>
          <p className="text-zinc-400 text-base md:text-lg italic mt-8">
            Bu yolculukta soframıza konuk olduğunuz için teşekkürler. Afiyetle!
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-white/5 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h1 className="text-2xl font-black text-[#E8D5B7] italic">VIA VENTO</h1>
            <p className="text-zinc-500 text-sm mt-4">Eryaman'ın kalbinde butik pizza deneyimi.</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-zinc-400">Yasal</h4>
            <button onClick={() => setLegalModal("iptal")} className="text-zinc-600 hover:text-white text-sm text-left">İptal ve İade</button>
            <button onClick={() => setLegalModal("mesafeli")} className="text-zinc-600 hover:text-white text-sm text-left">Mesafeli Satış</button>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-zinc-400">İletişim</h4>
            <a href="https://instagram.com/viaventopizza" target="_blank" className="text-[#E8D5B7] font-bold">@viaventopizza</a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CART BAR */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900 border-t border-white/10 p-4 safe-area-inset-bottom">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#E8D5B7] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
          >
            <ShoppingCart size={20} />
            <span>Sepete Git</span>
            <span className="bg-black/20 px-3 py-1 rounded-full text-sm">{totalItems} ürün</span>
          </button>
        </div>
      )}
    </div>
  );
}
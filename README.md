# Bus Reservation App

Otobüs bileti arama, listeleme ve koltuk seçimi akışını içeren full-stack bir örnek projedir. Frontend React + TanStack Router/Query ile, backend ise Manifest tabanlı bir Node API ile geliştirilmiştir.

## Kurulum

> Tavsiye edilen paket yöneticisi: **pnpm**

### 1. Bağımlılıkların yüklenmesi

```bash
# pnpm ile (önerilen)
pnpm install

# Alternatif: npm ile
npm install
```

## Çalıştırma

Proje Turbo ile orkestre edilen iki uygulamadan oluşur: `apps/frontend` ve `apps/backend`.

### 1. Geliştirme ortamı (frontend + backend birlikte)

Kök dizinde:

```bash
# pnpm
pnpm dev

# Alternatif: npm
npm run dev
```

Bu komut Turbo üzerinden:

- `apps/backend`: Manifest tabanlı API server + otomatik `seed` (örnek veriler)
- `apps/frontend`: Vite dev server

çalıştırır.

### 2. Sadece frontend

```bash
cd apps/frontend

# pnpm
pnpm dev

# npm
npm run dev
```

Varsayılan olarak `http://localhost:3000` üzerinden çalışır.

### 3. Sadece backend

```bash
cd apps/backend

# Geliştirme
pnpm dev
# veya
npm run dev

# Prod benzeri başlatma
pnpm start
# veya
npm start
```

Backend başlatıldığında `scripts/run-with-seed.js` yardımıyla kısa bir gecikmeden sonra `scripts/seed.js` çalışır ve:

- Şehirler
- Firmalar
- Seferler
- Koltuk şemaları ve koltuklar

otomatik olarak seed edilir.

### 4. Testler

#### Frontend testleri

```bash
cd apps/frontend

# pnpm
pnpm test

# npm
npm test
```

Kök dizinde henüz global bir test script’i tanımlı değil; testleri uygulama bazında çalıştırmak önerilir.

---

## Teknik Tercihler (Kısa Gerekçeler)

### Frontend

- **React 19 + Vite**
  - Hızlı HMR, basit config, modern React özellikleri ile uyumlu.
- **TanStack Router**
  - Dosya tabanlı routing, loader/validateSearch ile URL tabanlı state yönetimi.
  - `Await` + `Suspense` ile data-fetching durumları (loading/error).
- **TanStack Query**
  - API çağrılarında cache, background refetch ve error handling sağlayarak kodu sadeleştiriyor.
- **React Hook Form + Zod**
  - Formlarda tip güvenliği, schema bazlı validasyon ve iyi performans.
- **TailwindCSS + UI bileşenleri (Radix tabanlı)**
  - Hızlı prototipleme, tutarlı tasarım ve erişilebilir bileşenler.
- **i18next**
  - Çok dilli destek için standart ve esnek çözüm.

### Backend

- **Manifest**
  - Hızlı CRUD geliştirme, koleksiyon bazlı API’ler ve konfigürasyon yerine konvansiyon odaklı mimari.
- **Node 20+ ESM**
  - Modern modül sistemi, daha iyi TypeScript/Tooling uyumu.
- **Seed script (scripts/seed.js)**
  - Gerçekçi örnek veriler (şehirler, ajanslar, seferler, koltuk şemaları) oluşturarak UI akışını sonuna kadar test etmeyi kolaylaştırıyor.

### Monorepo & Tooling

- **pnpm workspace**
  - Hızlı ve disk dostu dependency yönetimi, paylaşılan node_modules.
- **Turbo**
  - `dev`, `build`, `start` gibi komutları frontend ve backend için orkestre eder; cache ile CI ve lokal geliştirmeyi hızlandırır.

---

## Mimari Özet

### Temel Yapı

- **apps/frontend**
  - React + Vite SPA
  - TanStack Router ile sayfa yapısı
  - TanStack Query ile API entegrasyonu
- **apps/backend**
  - Manifest tabanlı REST API
  - Seed script ile örnek veri

### Önemli Frontend Modülleri

- **Feature-based component yapısı (`src/components/features/*`)**

  - Bileşenler "özellik" bazlı klasörlere ayrıldı (ör. `search`, `popular-trips`).
  - Her feature klasörü kendi UI parçalarını, form bileşenlerini ve loading durumlarını içerir.
  - **Neden?** Yeni özellik eklerken veya mevcut bir özelliği değiştirirken ilgili tüm kodun tek yerde toplanması, okumayı ve bakımını kolaylaştırır.

- **Routing modülleri (`src/routes/*`)**

  - Her route kendi dosyasında TanStack Router ile tanımlı (ör. `index.tsx`, `search.tsx`).
  - `validateSearch` ve `loader` fonksiyonları ile URL tabanlı state (search parametreleri) tip güvenli şekilde yönetilir.
  - **Neden?** Sayfa bazlı ayrım, veri yükleme (loader), validasyon ve UI'nin aynı dosyada konumlanmasını sağlar; route davranışı tek yerden okunabilir.

- **Search feature (`src/components/features/search`)**

  - `SearchForm`: Kalkış/varış şehirleri ve tarih seçimi, Zod + React Hook Form ile validasyon.
  - `SearchResults`: Arama sonuç listesinin render edilmesi ve boş durum yönetimi.
  - `SearchCard`: Sefer kartı, koltuk şeması ve koltuk seçimi UI'si.
  - `loading.tsx`: Search sonuçları için skeleton state.
  - **Neden?** Arama akışındaki tüm görsel ve etkileşimli parçalar tek bir feature altında toplandığı için, hem UX iterasyonu hem de domain değişiklikleri izole şekilde yapılabiliyor.

- **OpenAPI auto-generated tipler (`apps/frontend/openapi`)**

  - Backend Manifest API şemasından otomatik üretilen TypeScript tipleri ve client yardımcıları.
  - `openapi-typescript` ve `generate-api-services` script'i ile güncel tutulur.
  - TanStack Query ile birlikte kullanılarak endpoint'ler için tip güvenli hook'lar ve response tipleri sağlanır.
  - **Neden?** API değişikliklerinde manuel tip yazma ihtiyacını ortadan kaldırır, frontend ve backend arasında tip uyumsuzluğu riskini ciddi şekilde azaltır.

- **Popüler seferler (`src/components/features/popular-trips`)**
  - Anasayfada öne çıkan rotaları gösterir, kullanıcıyı hızlıca arama sayfasına yönlendirir.
  - OpenAPI tipleri üzerinden gelen veriyi kullanarak kart bazlı bir liste üretir.
  - **Neden?** Keşif amaçlı bir giriş noktası sunar; arama formuna girmeden önce kullanıcının senaryoları görmesini sağlar.

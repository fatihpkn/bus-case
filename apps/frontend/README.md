# Frontend Uygulaması

Bu klasör, otobüs bileti/hat yönetimi case'inin React + TanStack Router tabanlı **frontend** uygulamasını içerir. Uygulama Vite ile çalışır, Tailwind CSS ile stillendirilir ve veri erişimi için TanStack Query ile OpenAPI tabanlı servisler kullanır.

## Teknolojiler

- **React 19**
- **Vite** (geliştirme sunucusu ve build)
- **TanStack Router** (dosya tabanlı routing)
- **TanStack Query** (server state yönetimi)
- **Tailwind CSS 4**
- **React Hook Form + Zod** (form & doğrulama)
- **i18next / react-i18next** (çok dillilik)
- **Vitest + Testing Library** (test)

## Gereksinimler

- Node.js (önerilen: 20+)
- pnpm (projede kullanılan paket yöneticisi)

## Kurulum

Projeyi klonladıktan sonra monorepo kökünde aşağıdakileri çalıştırın:

```bash
pnpm install
```

Ardından frontend için geliştirme sunucusunu başlatın:

```bash
cd apps/frontend
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

> Not: Monorepo yapısından dolayı `pnpm dev` komutu kökte bir `turbo`/`pnpm` script'i üzerinden de tetikleniyor olabilir. Tercihinize göre kökten veya `apps/frontend` içinden çalıştırabilirsiniz.

## Script'ler

`apps/frontend/package.json` içinde tanımlı başlıca script'ler:

- **Geliştirme**
  - `pnpm dev` – Vite geliştirme sunucusunu 3000 portunda başlatır.

- **Build & Preview**
  - `pnpm build` – Üretim için derleme alır.
  - `pnpm start` – Build edilmiş uygulamayı Vite preview ile çalıştırır.

- **API Tip Üretimi**
  - `pnpm generate:api-types` – `openapi` tanımlarından TypeScript servis ve tiplerini üretir (`scripts/generate-api-services.js`).

- **Test**
  - `pnpm test` – Vitest testlerini çalıştırır.

- **Lint & Format**
  - `pnpm lint` – ESLint kontrollerini çalıştırır.
  - `pnpm format` – Prettier formatlama kontrolü (mevcut konfigürasyona göre read-only veya write olabilir).
  - `pnpm check` – Prettier ve ESLint'i fix modunda çalıştırır (`prettier --write . && eslint --fix`).

- **i18n**
  - `pnpm i18n:extract` – i18next çeviri anahtarlarını kaynak koddan çıkarır (watch modunda).
  - `pnpm i18n:types` – i18n tip dosyalarını üretir (watch modunda).
  - `pnpm i18n:status` – çeviri dosyalarının durumunu gösterir.

## Proje Yapısı

`apps/frontend/src` klasörü temel olarak aşağıdaki yapıya sahiptir:

- `api/` – OpenAPI tabanlı istemciler ve API ile ilgili yardımcılar.
- `components/` – Paylaşılan UI bileşenleri (butonlar, input'lar, layout bileşenleri vb.).
- `hooks/` – Özel React hook'ları.
- `i18n/` – i18next konfigürasyonu ve çeviri ile ilgili yardımcılar.
- `integrations/` – Dış servis/SDK entegrasyonları (varsa).
- `lib/` – Ortak yardımcı fonksiyonlar, domain katmanı, utility'ler.
- `routes/` – TanStack Router dosya tabanlı route tanımları.
- `test/` – Test yardımcıları ve ortak test setup'ları.
- `main.tsx` – Uygulamanın giriş noktası; router, i18n, query client vb. sağlayıcıların bağlandığı yer.
- `styles.css` – Global stiller ve Tailwind entry point'i.

## Çalışma Şekli

- Routing, `src/routes` altındaki dosya yapısına göre TanStack Router tarafından otomatik üretilen `routeTree.gen.ts` üzerinden yönetilir.
- Veri erişimi için çoğunlukla TanStack Query kullanılır; API çağrıları OpenAPI tipleri ile type-safe hale getirilir.
- Formlar `react-hook-form` ve `zod` ile yönetilir; doğrulama şemaları TypeScript ile uyumlu olacak şekilde tanımlanır.
- i18n için `i18next` ve `react-i18next` kullanılır; dil dosyaları `src/i18n` altında tutulur.

## Ortam Değişkenleri

Bu klasörde aşağıdaki dosyalar mevcuttur:

- `.env`
- `.env.development`

Geliştirme ortamında kullanılan başlıca değişkenler:

- `FRONTEND_API_BASE_URL`  
  Backend API istekleri için kullanılan temel adres. Örn:
  ```env
  FRONTEND_API_BASE_URL=http://localhost:1111/api
  ```

- `FRONTEND_SLOWDOWN_API_TIME`  
  Geliştirme sırasında API isteklerine yapay gecikme eklemek için kullanılan süre (ms cinsinden). Örn:
  ```env
  FRONTEND_SLOWDOWN_API_TIME=200
  ```

Varsayılan değerleri `.env.development` içinde bulabilirsiniz. Gerekirse kendi lokal kurulumunuza göre bu değerleri güncelleyebilirsiniz.

## Test Çalıştırma

Vitest testlerini çalıştırmak için:

```bash
pnpm test
```

Varsayılan olarak JSDOM ortamında `@testing-library/react` ve `@testing-library/user-event` ile birlikte çalışır.

## Kod Kalitesi

- ESLint konfigürasyonu `@tanstack/eslint-config` tabanlıdır.
- Prettier ile kod formatı standart hale getirilir.
- `pnpm check` komutu ile hem format hem lint otomatik düzeltilir.

## Geliştirme İpuçları

- Yeni sayfalar/ekranlar eklerken `src/routes` altında yeni route dosyaları oluşturun.
- Ortak UI parçalarını `src/components` içine taşıyın.
- API ile ilgili tüm tip ve istekleri `openapi` + `api` katmanında merkezileştirmeye çalışın.
- Yeni çeviri metinleri eklerken önce `i18n:extract` ile anahtarları üretip ilgili dil dosyalarını güncelleyin.

Bu README, projeyi hızlıca ayağa kaldırmak ve geliştirme ortamını anlamak için özet bir rehber niteliğindedir.